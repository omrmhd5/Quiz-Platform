"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/ui/action-control";
import { loginTeacher, type LoginState } from "@/server/actions/auth";
import {
  alertErrorClassName,
  inputClassName,
  labelClassName,
} from "@/lib/utils";

const initialState: LoginState = {};

export function LoginForm() {
  const t = useTranslations("login");
  const tActions = useTranslations("actions");
  const [state, formAction, isPending] = useActionState(
    loginTeacher,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="username" className={labelClassName}>
          {t("username")}
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className={inputClassName}
          placeholder={t("usernamePlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className={labelClassName}>
          {t("password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClassName}
          placeholder={t("passwordPlaceholder")}
        />
      </div>

      {state.error ? (
        <p role="alert" className={alertErrorClassName}>
          {state.error}
        </p>
      ) : null}

      <ActionButton
        action="signIn"
        type="submit"
        disabled={isPending}
        className="w-full"
        label={isPending ? t("signingIn") : tActions("signIn")}
      />
    </form>
  );
}
