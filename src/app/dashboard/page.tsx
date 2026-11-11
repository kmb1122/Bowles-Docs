import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { ImportDocumentForm } from "@/app/dashboard/import-document-form";
import { createClient } from "@/lib/supabase/server";

function isMissingTable(error: { code: string }) {
  return error.code === "42P01" || error.code === "PGRST205";
}

export const metadata: Metadata = {
  title: "Dashboard | Bowles Docs",
};

export default async function DashboardPage() {
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

  const { data: documentRows, error: ownedDocumentsError } = await supabase
    .from("documents")
    .select("id, title, updated_at")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  const documentsTableMissing =
    ownedDocumentsError !== null && isMissingTable(ownedDocumentsError);

  if (ownedDocumentsError && !documentsTableMissing) {
    throw new Error(ownedDocumentsError.message);
  }

  const ownedDocuments = documentRows ?? [];
  let sharesTableMissing = false;
  let sharedDocuments: typeof ownedDocuments = [];

  if (!documentsTableMissing) {
    const { data: shares, error: sharesError } = await supabase
      .from("document_shares")
      .select("document_id")
      .eq("shared_with_user_id", user.id);

    sharesTableMissing = sharesError !== null && isMissingTable(sharesError);

    if (sharesError && !sharesTableMissing) {
      throw new Error(sharesError.message);
    }

    const sharedDocumentIds = (shares ?? []).map((share) => share.document_id);

    if (sharedDocumentIds.length > 0) {
      const { data, error: sharedDocumentsError } = await supabase
        .from("documents")
        .select("id, title, updated_at")
        .in("id", sharedDocumentIds)
        .order("updated_at", { ascending: false });

      if (sharedDocumentsError) {
        throw new Error(sharedDocumentsError.message);
      }

      sharedDocuments = data;
    }
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <Link className="auth-brand" href="/">
            Bowles Docs
          </Link>
          <p className="dashboard-account">Signed in as {user.email}</p>
        </div>
        <div className="dashboard-actions">
          {!documentsTableMissing && (
            <Link className="dashboard-create" href="/documents/new">
              Create new document
            </Link>
          )}
          <form action={signOut}>
            <button className="dashboard-logout" type="submit">
              Log out
            </button>
          </form>
        </div>
      </header>

      {documentsTableMissing && (
        <p className="dashboard-notice" role="status">
          The document database is not set up yet. Apply the Supabase migration
          with <code>supabase db push</code> to enable document features.
        </p>
      )}
      {!documentsTableMissing && sharesTableMissing && (
        <p className="dashboard-notice" role="status">
          Document sharing is not set up yet. Apply the Supabase migration with{" "}
          <code>supabase db push</code> to enable shared documents.
        </p>
      )}

      {!documentsTableMissing && (
        <div className="dashboard-content">
          <section className="import-section" aria-labelledby="import-heading">
            <h2 id="import-heading">Bring in a file</h2>
            <ImportDocumentForm />
          </section>
        </div>
      )}

      <div className="dashboard-content">
        <section className="document-section" aria-labelledby="owned-heading">
          <h1 id="owned-heading">Your documents</h1>
          {ownedDocuments.length > 0 ? (
            <ul className="document-list">
              {ownedDocuments.map((document) => (
                <li className="document-card" key={document.id}>
                  <Link href={`/documents/${document.id}`}>{document.title}</Link>
                  <span>
                    Updated {new Date(document.updated_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="document-empty">
              You haven&apos;t created any documents yet.
            </p>
          )}
        </section>

        <section className="document-section" aria-labelledby="shared-heading">
          <h2 id="shared-heading">Shared with you</h2>
          {sharedDocuments.length > 0 ? (
            <ul className="document-list">
              {sharedDocuments.map((document) => (
                <li className="document-card" key={document.id}>
                  <Link href={`/documents/${document.id}`}>{document.title}</Link>
                  <span>
                    Updated {new Date(document.updated_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="document-empty">
              Documents shared with you will appear here.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
