import type { Metadata } from "next";
import Link from "next/link";
import { signUp } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Sign up | Bowles Docs",
};

export default function SignupPage() {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="signup-heading">
        <Link className="auth-brand" href="/">
          Bowles Docs
        </Link>
        <p className="auth-eyebrow">Get started</p>
        <h1 id="signup-heading" className="auth-heading">
          Create your account
        </h1>
        <p className="auth-description">
          Sign up to access your Bowles documentation.
        </p>

        <form className="auth-form" action={signUp}>
          <label className="auth-field">
            <span>Email</span>
            <input
              className="auth-input"
              type="email"
              name="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input
              className="auth-input"
              type="password"
              name="password"
              autoComplete="new-password"
              required
            />
          </label>
          <button className="auth-submit" type="submit">
            Create account
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
