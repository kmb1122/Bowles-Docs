import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <main>
      <h1>Bowles Docs</h1>
      <p>Signed in as {user.email}</p>
      <form action={signOut}>
        <button className="auth-submit" type="submit">
          Log out
        </button>
      </form>
    </main>
  );
}
