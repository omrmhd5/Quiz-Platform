"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  studentActionInitialState,
  type StudentActionState,
} from "@/lib/students";
import { createStudent } from "@/server/actions/students";

export function AddStudentForm() {
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
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-zinc-900">Add student</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Student ID must be unique letters and numbers only.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="id"
            className="block text-sm font-medium text-zinc-700">
            Student ID
          </label>
          <input
            id="id"
            name="id"
            type="text"
            required
            placeholder="2024001"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900 focus:ring-2"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-zinc-700">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Alex Smith"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900 focus:ring-2"
          />
        </div>
      </div>

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
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70">
        {isPending ? "Adding..." : "Add student"}
      </button>
    </form>
  );
}
