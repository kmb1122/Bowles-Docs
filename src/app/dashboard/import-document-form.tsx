"use client";

import { useActionState } from "react";
import {
  importDocument,
  type ImportDocumentState,
} from "@/app/actions/documents";

const initialState: ImportDocumentState = { error: null };

export function ImportDocumentForm() {
  const [state, formAction, isPending] = useActionState(
    importDocument,
    initialState,
  );

  return (
    <form className="import-form" action={formAction}>
      <label className="import-file-field">
        <span>Import a text or Markdown file</span>
        <input
          type="file"
          name="file"
          accept=".txt,.md,.markdown,text/plain,text/markdown"
          required
        />
      </label>
      <p className="import-help">
        Supports .txt, .md, and .markdown files up to 1 MB. Markdown headings
        and lists are preserved.
      </p>
      {state.error && (
        <p className="auth-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="dashboard-back" type="submit" disabled={isPending}>
        {isPending ? "Importing..." : "Import file"}
      </button>
    </form>
  );
}
