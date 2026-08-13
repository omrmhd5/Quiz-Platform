"use client";

import { useActionState, useEffect, useState } from "react";
import {
  studentActionInitialState,
  type StudentActionState,
} from "@/lib/students";
import {
  alertErrorClassName,
  alertSuccessClassName,
  buttonPrimaryClassName,
  inputClassName,
  panelClassName,
} from "@/lib/utils";
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
      className={`${panelClassName} space-y-4`}>
      <div>
        <h2 className="text-base font-semibold text-zinc-900">Add student</h2>
        <p className="mt-1 text-sm text-zinc-600">
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
            className={inputClassName}
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

      <button
        type="submit"
        disabled={isPending}
        className={buttonPrimaryClassName}>
        {isPending ? "Adding..." : "Add student"}
      </button>
    </form>
  );
}
