"use client";

import { useActionState } from "react";
import { loginTeacher, type LoginState } from "@/server/actions/auth";
import {
  alertErrorClassName,
  buttonPrimaryClassName,
  inputClassName,
} from "@/lib/utils";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginTeacher,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="username"
          className="block text-sm font-medium text-zinc-700">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className={inputClassName}
          placeholder="Enter your username"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-zinc-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClassName}
          placeholder="Enter your password"
        />
      </div>

      {state.error ? (
        <p role="alert" className={alertErrorClassName}>
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className={`${buttonPrimaryClassName} w-full`}>
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
