import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { saveDocument } from "@/app/actions/documents";
import { DocumentEditor } from "@/app/documents/document-editor";
import { createClient } from "@/lib/supabase/server";

type EditDocumentPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit document | Bowles Docs",
};

export default async function EditDocumentPage({
  params,
}: EditDocumentPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    redirect("/login");
  }

  const { data: document, error } = await supabase
    .from("documents")
    .select("owner_id, title, content")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!document) {
    notFound();
  }

  if (document.owner_id !== user.id) {
    redirect(`/documents/${id}`);
  }

  const saveAction = saveDocument.bind(null, id);

  return (
    <main className="document-page">
      <header className="document-page-header">
        <Link className="auth-brand" href="/dashboard">
          Bowles Docs
        </Link>
        <Link className="dashboard-back" href={`/documents/${id}`}>
          Cancel
        </Link>
      </header>
      <section className="document-editor-page" aria-label="Edit document">
        <DocumentEditor
          title={document.title}
          content={document.content}
          saveAction={saveAction}
        />
      </section>
    </main>
  );
}
