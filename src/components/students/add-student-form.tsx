"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  studentActionInitialState,
  type StudentActionState,
} from "@/lib/students";
import {
  alertErrorClassName,
  alertSuccessClassName,
  inputClassName,
  panelClassName,
} from "@/lib/utils";
import { ActionButton } from "@/components/ui/action-control";
import { createStudent } from "@/server/actions/students";

export function AddStudentForm() {
  const t = useTranslations("students");
  const [state, formAction, isPending] = useActionState<
    StudentActionState,
    FormData
  >(createStudent, studentActionInitialState);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (state.success) {
      setFormKey((current) => current + 1);
    }
  }, [state.success]);

  return (
    <form
      key={formKey}
      action={formAction}
      className={`${panelClassName} space-y-4`}>
      <div>
        <h2 className="text-base font-semibold text-zinc-900">{t("addTitle")}</h2>
        <p className="mt-1 text-sm text-zinc-600">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="id" className="block text-sm font-medium text-zinc-700">
            {t("id")}
          </label>
          <input
            id="id"
            name="id"
            type="text"
            required
            placeholder="2024001"
            className={inputClassName}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-zinc-700">
            {t("name")}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder={t("namePlaceholder")}
            className={inputClassName}
          />
        </div>
      </div>

      {state.error ? (
        <p role="alert" className={alertErrorClassName}>
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className={alertSuccessClassName}>{state.success}</p>
      ) : null}

      <ActionButton
        action="add"
        type="submit"
        disabled={isPending}
        label={isPending ? t("adding") : t("addTitle")}
      />
    </form>
  );
}
