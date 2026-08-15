"use client";

import { useActionState, useEffect, useState } from "react";
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
        <h2 className="text-base font-semibold text-zinc-900">Bulk import</h2>
        <p className="mt-1 text-sm text-zinc-600">
          One student per line:{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-800">
            id,name
          </code>
        </p>
      </div>

      <textarea
        name="bulk"
        rows={6}
        value={bulk}
        onChange={(event) => setBulk(event.target.value)}
        placeholder={
          "2024001,Alex Smith\n2024002,Jordan Lee\n2024003,Sam Patel"
        }
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
        label={isPending ? "Importing..." : "Import students"}
      />
    </form>
  );
}
