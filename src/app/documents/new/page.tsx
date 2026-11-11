import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createDocument } from "@/app/actions/documents";
import { DocumentEditor } from "@/app/documents/document-editor";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "New document | Bowles Docs",
};

export default async function NewDocumentPage() {
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

  return (
    <main className="document-page">
      <header className="document-page-header">
        <Link className="auth-brand" href="/dashboard">
          Bowles Docs
        </Link>
        <Link className="dashboard-back" href="/dashboard">
          Back to dashboard
        </Link>
      </header>
      <section className="document-editor-page" aria-label="Create document">
        <DocumentEditor saveAction={createDocument} />
      </section>
    </main>
  );
}
