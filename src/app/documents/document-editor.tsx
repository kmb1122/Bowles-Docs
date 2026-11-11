"use client";

import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { FormEvent } from "react";
import { useState } from "react";

const EMPTY_DOCUMENT: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

const EDITOR_EXTENSIONS = [StarterKit.configure({ link: false })];

function parseContent(content: string): JSONContent {
  if (!content) {
    return EMPTY_DOCUMENT;
  }

  try {
    const parsed: unknown = JSON.parse(content);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "type" in parsed &&
      parsed.type === "doc"
    ) {
      return parsed as JSONContent;
    }
  } catch {
    return {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: content }] }],
    };
  }

  return {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text: content }] }],
  };
}

type DocumentEditorProps = {
  title?: string;
  content?: string;
  saveAction: (formData: FormData) => void | Promise<void>;
};

export function DocumentEditor({
  title = "",
  content = "",
  saveAction,
}: DocumentEditorProps) {
  const [editorContent, setEditorContent] = useState(() =>
    JSON.stringify(parseContent(content)),
  );
  const editor = useEditor({
    extensions: EDITOR_EXTENSIONS,
    content: parseContent(content),
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      setEditorContent(JSON.stringify(currentEditor.getJSON()));
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!editor) {
      event.preventDefault();
    }
  }

  return (
    <form
      className="document-editor-form"
      action={saveAction}
      onSubmit={handleSubmit}
    >
      <label className="document-title-field">
        <span className="visually-hidden">Document title</span>
        <input
          className="document-title-input"
          type="text"
          name="title"
          defaultValue={title}
          maxLength={120}
          placeholder="Untitled document"
          aria-label="Document title"
          required
        />
      </label>

      <div className="editor-toolbar" role="toolbar" aria-label="Text formatting">
        <button
          className="editor-tool"
          type="button"
          aria-label="Bold"
          aria-pressed={editor?.isActive("bold") ?? false}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </button>
        <button
          className="editor-tool"
          type="button"
          aria-label="Italic"
          aria-pressed={editor?.isActive("italic") ?? false}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </button>
        <button
          className="editor-tool"
          type="button"
          aria-label="Underline"
          aria-pressed={editor?.isActive("underline") ?? false}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <u>U</u>
        </button>
        <span className="editor-toolbar-divider" aria-hidden="true" />
        <button
          className="editor-tool"
          type="button"
          aria-label="Heading 1"
          aria-pressed={editor?.isActive("heading", { level: 1 }) ?? false}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </button>
        <button
          className="editor-tool"
          type="button"
          aria-label="Heading 2"
          aria-pressed={editor?.isActive("heading", { level: 2 }) ?? false}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </button>
        <span className="editor-toolbar-divider" aria-hidden="true" />
        <button
          className="editor-tool"
          type="button"
          aria-label="Bulleted list"
          aria-pressed={editor?.isActive("bulletList") ?? false}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          • List
        </button>
        <button
          className="editor-tool"
          type="button"
          aria-label="Numbered list"
          aria-pressed={editor?.isActive("orderedList") ?? false}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </button>
      </div>

      <input type="hidden" name="content" value={editorContent} readOnly />
      <EditorContent editor={editor} className="document-editor-content" />

      <footer className="document-editor-footer">
        <button className="auth-submit editor-save" type="submit" disabled={!editor}>
          Save
        </button>
      </footer>
    </form>
  );
}

export function DocumentContent({ content }: { content: string }) {
  const editor = useEditor({
    extensions: EDITOR_EXTENSIONS,
    content: parseContent(content),
    editable: false,
    immediatelyRender: false,
  });

  return <EditorContent editor={editor} className="document-rendered-content" />;
}
