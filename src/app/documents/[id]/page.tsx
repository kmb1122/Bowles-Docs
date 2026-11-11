import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DocumentContent } from "@/app/documents/document-editor";
import { ShareForm } from "@/app/documents/share-form";
import { createClient } from "@/lib/supabase/server";

type DocumentPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Document | Bowles Docs",
};

export default async function DocumentPage({ params }: DocumentPageProps) {
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
    .select("owner_id, title, content, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!document) {
    notFound();
  }

  return (
    <main className="document-page">
      <header className="document-page-header">
        <Link className="auth-brand" href="/dashboard">
          Bowles Docs
        </Link>
        <div className="document-page-actions">
          {document.owner_id === user.id && (
            <Link className="dashboard-back" href={`/documents/${id}/edit`}>
              Edit document
            </Link>
          )}
          <Link className="dashboard-back" href="/dashboard">
            Back to dashboard
          </Link>
        </div>
      </header>
      <article className="document-view">
        <h1>{document.title}</h1>
        <p className="document-updated">
          Updated {new Date(document.updated_at).toLocaleDateString()}
        </p>
        {document.owner_id === user.id && (
          <ShareForm documentId={id} />
        )}
        <DocumentContent content={document.content} />
      </article>
    </main>
  );
}
