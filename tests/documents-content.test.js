const test = require("node:test");
const assert = require("node:assert/strict");
const {
  MAX_DOCUMENT_CONTENT_LENGTH,
  textToTiptapDocument,
  validateTiptapDocument,
} = require("../src/lib/documents/content.js");

test("imports Markdown headings and lists into Tiptap blocks", () => {
  const document = textToTiptapDocument(
    "# Plan\n\nFirst paragraph\n- Draft\n- Review\n1. Publish",
  );

  assert.deepEqual(
    document.content.map((block) => block.type),
    ["heading", "paragraph", "bulletList", "orderedList"],
  );
  assert.equal(document.content[0].attrs.level, 1);
  assert.equal(document.content[2].content.length, 2);
});

test("preserves plain text in separate paragraphs", () => {
  const document = textToTiptapDocument("First line\r\nSecond line");

  assert.deepEqual(
    document.content.map((block) => block.content[0].text),
    ["First line", "Second line"],
  );
});

test("rejects malformed or oversized editor content", () => {
  assert.throws(() => validateTiptapDocument("{"), /valid editor data/);
  assert.throws(
    () => validateTiptapDocument(" ".repeat(MAX_DOCUMENT_CONTENT_LENGTH + 1)),
    /1 MB limit/,
  );
  assert.throws(
    () => validateTiptapDocument(JSON.stringify({ type: "paragraph" })),
    /valid editor data/,
  );
});

test("accepts and serializes valid Tiptap content", () => {
  const value = '{"type":"doc","content":[{"type":"paragraph"}]}';

  assert.equal(validateTiptapDocument(value), value);
});
