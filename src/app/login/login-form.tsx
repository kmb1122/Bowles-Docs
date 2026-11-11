"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form className="auth-form" action={formAction}>
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
      {state.error && (
        <p className="auth-error" role="alert">
          {state.error}
        </p>
      )}
      <button className="auth-submit" type="submit" disabled={isPending}>
        {isPending ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
