"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  MAX_DOCUMENT_CONTENT_LENGTH,
  textToTiptapDocument,
  validateTiptapDocument,
} from "@/lib/documents/content";

const MAX_IMPORT_SIZE = 1_000_000;

function getDocumentFields(formData: FormData) {
  const titleValue = formData.get("title");
  const contentValue = formData.get("content");

  if (typeof titleValue !== "string") {
    throw new Error("A document title is required.");
  }

  const title = titleValue.trim();

  if (!title || title.length > 120) {
    throw new Error("Document titles must be between 1 and 120 characters.");
  }

  if (
    typeof contentValue !== "string" ||
    contentValue.length > MAX_DOCUMENT_CONTENT_LENGTH
  ) {
    throw new Error("Document content is missing or exceeds the size limit.");
  }

  return { title, content: validateTiptapDocument(contentValue) };
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function createDocument(formData: FormData) {
  const { title, content } = getDocumentFields(formData);
  const { supabase, user } = await getAuthenticatedUser();

  const { data: document, error } = await supabase
    .from("documents")
    .insert({ owner_id: user.id, title, content })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/documents/${document.id}`);
}

export async function saveDocument(id: string, formData: FormData) {
  const { title, content } = getDocumentFields(formData);
  const { supabase, user } = await getAuthenticatedUser();

  const { data: document, error } = await supabase
    .from("documents")
    .update({
      title,
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!document) {
    throw new Error("The document could not be saved. Check that you own it.");
  }

  redirect(`/documents/${document.id}`);
}

export type ImportDocumentState = {
  error: string | null;
};

export async function importDocument(
  _previousState: ImportDocumentState,
  formData: FormData,
): Promise<ImportDocumentState> {
  const fileValue = formData.get("file");

  if (!(fileValue instanceof File) || fileValue.size === 0) {
    return { error: "Choose a non-empty .txt or .md file to import." };
  }

  if (fileValue.size > MAX_IMPORT_SIZE) {
    return { error: "Files must be 1 MB or smaller." };
  }

  const extension = fileValue.name.split(".").pop()?.toLowerCase();
  if (extension !== "txt" && extension !== "md" && extension !== "markdown") {
    return { error: "Only .txt, .md, and .markdown files are supported." };
  }

  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(
      await fileValue.arrayBuffer(),
    );
  } catch {
    return { error: "The selected file must contain valid UTF-8 text." };
  }

  const title = fileValue.name.replace(/\.(txt|md|markdown)$/i, "").trim();
  if (!title || title.length > 120) {
    return {
      error: "The file name must produce a title of 1 to 120 characters.",
    };
  }

  const { supabase, user } = await getAuthenticatedUser();
  const content = JSON.stringify(textToTiptapDocument(text));
  const { data: document, error } = await supabase
    .from("documents")
    .insert({ owner_id: user.id, title, content })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/documents/${document.id}/edit`);
}

export type ShareDocumentState = {
  error: string | null;
  success: string | null;
};

export async function shareDocument(
  documentId: string,
  _previousState: ShareDocumentState,
  formData: FormData,
): Promise<ShareDocumentState> {
  const emailValue = formData.get("email");

  if (typeof emailValue !== "string") {
    return { error: "Enter the email address of the person to share with.", success: null };
  }

  const email = emailValue.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address.", success: null };
  }

  const { supabase } = await getAuthenticatedUser();
  const { error } = await supabase.rpc("share_document_with_user", {
    p_document_id: documentId,
    p_email: email,
  });

  if (error) {
    if (error.message.includes("No account found")) {
      return {
        error: "No Bowles Docs account was found for that email address.",
        success: null,
      };
    }
    if (error.message.includes("Only the document owner")) {
      return { error: "Only the document owner can share it.", success: null };
    }
    throw new Error(error.message);
  }

  return { error: null, success: "Document shared successfully." };
}
