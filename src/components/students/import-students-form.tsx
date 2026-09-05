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
import { importStudents } from "@/server/actions/students";

export function ImportStudentsForm() {
  const t = useTranslations("students");
  const [state, formAction, isPending] = useActionState<
    StudentActionState,
    FormData
  >(importStudents, studentActionInitialState);
  const [bulk, setBulk] = useState("");

  useEffect(() => {
    if (state.success) {
      setBulk("");
    }
  }, [state.success]);

  return (
    <form action={formAction} className={`${panelClassName} space-y-4`}>
      <div>
        <h2 className="text-base font-semibold text-zinc-900">
          {t("importTitle")}
        </h2>
        <p className="mt-1 text-sm text-zinc-600">{t("importHint")}</p>
      </div>

      <textarea
        name="bulk"
        rows={6}
        value={bulk}
        onChange={(event) => setBulk(event.target.value)}
        placeholder={t("importPlaceholder")}
        className={`${inputClassName} font-mono`}
      />

      {state.error ? (
        <p role="alert" className={alertErrorClassName}>
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className={alertSuccessClassName}>{state.success}</p>
      ) : null}

      <ActionButton
        action="import"
        type="submit"
        disabled={isPending}
        label={isPending ? t("importing") : t("importTitle")}
      />
    </form>
  );
}
