import type { Metadata } from "next";
import Link from "next/link";
import { login } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Log in | Bowles Docs",
};

export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-heading">
        <Link className="auth-brand" href="/">
          Bowles Docs
        </Link>
        <p className="auth-eyebrow">Welcome back</p>
        <h1 id="login-heading" className="auth-heading">
          Log in to your account
        </h1>
        <p className="auth-description">
          Enter your details to continue to your documentation.
        </p>

        <form className="auth-form" action={login}>
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
              autoComplete="current-password"
              required
            />
          </label>
          <button className="auth-submit" type="submit">
            Log in
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account? <Link href="/signup">Sign up</Link>
        </p>
      </section>
    </main>
  );
}
