"use client";

import { useActionState } from "react";
import {
  shareDocument,
  type ShareDocumentState,
} from "@/app/actions/documents";

const initialState: ShareDocumentState = { error: null, success: null };

export function ShareForm({ documentId }: { documentId: string }) {
  const shareAction = shareDocument.bind(null, documentId);
  const [state, formAction, isPending] = useActionState(
    shareAction,
    initialState,
  );

  return (
    <form className="share-form" action={formAction}>
      <label className="auth-field" htmlFor="share-email">
        Share with a Bowles Docs user
        <span className="share-input-row">
          <input
            className="auth-input"
            id="share-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="teammate@example.com"
            required
          />
          <button className="dashboard-create" type="submit" disabled={isPending}>
            {isPending ? "Sharing..." : "Share"}
          </button>
        </span>
      </label>
      {state.error && (
        <p className="auth-error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="share-success" role="status">
          {state.success}
        </p>
      )}
    </form>
  );
}
