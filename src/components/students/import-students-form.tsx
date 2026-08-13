"use client";

import { useActionState, useEffect, useState } from "react";
import {
  studentActionInitialState,
  type StudentActionState,
} from "@/lib/students";
import { importStudents } from "@/server/actions/students";

export function ImportStudentsForm() {
  const [state, formAction, isPending] = useActionState<
    StudentActionState,
    FormData
  >(importStudents, studentActionInitialState);
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
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-zinc-900">Bulk import</h2>
        <p className="mt-1 text-sm text-zinc-500">
          One student per line: <code className="text-zinc-700">id,name</code>
        </p>
      </div>

      <textarea
        name="bulk"
        rows={6}
        placeholder={
          "2024001,Alex Smith\n2024002,Jordan Lee\n2024003,Sam Patel"
        }
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm outline-none ring-zinc-900 focus:ring-2"
      />

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-70">
        {isPending ? "Importing..." : "Import students"}
      </button>
    </form>
  );
}
