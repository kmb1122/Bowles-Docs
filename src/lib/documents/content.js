const MAX_DOCUMENT_CONTENT_LENGTH = 1_000_000;

/**
 * Converts supported plain-text and Markdown blocks into Tiptap JSON.
 * @param {string} text
 * @returns {object}
 */
function textToTiptapDocument(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const content = [];
  let listType = null;
  let listItems = [];

  function flushList() {
    if (listType) {
      content.push({ type: listType, content: listItems });
      listType = null;
      listItems = [];
    }
  }

  for (const line of lines) {
    const heading = /^(#{1,2})\s+(.+)$/.exec(line);
    const bullet = /^\s*[-*+]\s+(.+)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.+)$/.exec(line);

    if (bullet || numbered) {
      const nextListType = bullet ? "bulletList" : "orderedList";
      if (listType !== nextListType) {
        flushList();
        listType = nextListType;
      }
      listItems.push({
        type: "listItem",
        content: [{ type: "paragraph", content: [{ type: "text", text: (bullet || numbered)[1] }] }],
      });
      continue;
    }

    flushList();

    if (!line.trim()) {
      continue;
    }

    if (heading) {
      content.push({
        type: "heading",
        attrs: { level: heading[1].length },
        content: [{ type: "text", text: heading[2] }],
      });
    } else {
      content.push({ type: "paragraph", content: [{ type: "text", text: line }] });
    }
  }

  flushList();
  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}

/**
 * Validates serialized Tiptap document data before storing it.
 * @param {string} value
 * @returns {string}
 */
function validateTiptapDocument(value) {
  if (value.length > MAX_DOCUMENT_CONTENT_LENGTH) {
    throw new Error("Document content exceeds the 1 MB limit.");
  }

  let content;
  try {
    content = JSON.parse(value);
  } catch {
    throw new Error("Document content is not valid editor data.");
  }

  if (
    typeof content !== "object" ||
    content === null ||
    content.type !== "doc" ||
    (content.content !== undefined && !Array.isArray(content.content))
  ) {
    throw new Error("Document content is not valid editor data.");
  }

  return JSON.stringify(content);
}

module.exports = {
  MAX_DOCUMENT_CONTENT_LENGTH,
  textToTiptapDocument,
  validateTiptapDocument,
};
