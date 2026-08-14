"use client";

import { useActionState } from "react";
import {
  alertErrorClassName,
  buttonPrimaryClassName,
  inputClassName,
  panelClassName,
} from "@/lib/utils";
import { joinActionInitialState } from "@/lib/sessions";
import { joinByStudentId } from "@/server/actions/sessions";

type JoinFormProps = {
  quizTitle?: string;
  quizRunning: boolean;
};

export function JoinForm({ quizTitle, quizRunning }: JoinFormProps) {
  const [state, formAction, isPending] = useActionState(
    joinByStudentId,
    joinActionInitialState,
  );

  return (
    <form action={formAction} className={`${panelClassName} space-y-5`}>
      {quizRunning && quizTitle ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
          Live quiz: <strong>{quizTitle}</strong>
        </p>
      ) : null}

      {!quizRunning ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
          No quiz is running right now. Wait for your teacher to launch one.
        </p>
      ) : (
        <>
          <div className="space-y-2">
            <label
              htmlFor="studentId"
              className="block text-sm font-medium text-zinc-700"
            >
              Student ID
            </label>
            <input
              id="studentId"
              name="studentId"
              type="text"
              required
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="Enter your ID"
              className={inputClassName}
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
            className={`${buttonPrimaryClassName} w-full`}
          >
            {isPending ? "Joining..." : "Join quiz"}
          </button>
        </>
      )}
    </form>
  );
}
