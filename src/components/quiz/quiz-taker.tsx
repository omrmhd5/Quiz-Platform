"use client";

import { useActionState, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { AttemptQuizView } from "@/lib/attempts";
import { submitAttemptInitialState } from "@/lib/attempts";
import {
  alertErrorClassName,
  buttonPrimaryClassName,
  cn,
  enterClassName,
  pageDescriptionClassName,
  pageTitleClassName,
  panelClassName,
} from "@/lib/utils";
import { submitAttempt } from "@/server/actions/attempts";

type QuizTakerProps = {
  quiz: AttemptQuizView;
};

export function QuizTaker({ quiz }: QuizTakerProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    submitAttempt,
    submitAttemptInitialState,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-2xl space-y-6 px-4 py-8",
        enterClassName,
      )}>
      <div className="space-y-1 text-center sm:text-left">
        <h1 className={pageTitleClassName}>{quiz.quizTitle}</h1>
        <p className={pageDescriptionClassName}>
          {quiz.studentName} · {quiz.totalQuestions} question
          {quiz.totalQuestions === 1 ? "" : "s"}
        </p>
      </div>

      <form ref={formRef} action={formAction} className="space-y-4">
        <input type="hidden" name="attemptId" value={quiz.attemptId} />

        {quiz.questions.map((question) => (
          <article key={question.id} className={`${panelClassName} space-y-4`}>
            <h2 className="text-base font-medium leading-snug text-zinc-900">
              {question.number}. {question.prompt}
            </h2>

            <fieldset className="space-y-2">
              <legend className="sr-only">Choose an answer</legend>
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-800",
                    "transition-colors has-checked:border-zinc-900 has-checked:bg-white",
                  )}>
                  <input
                    type="radio"
                    name={`answer-${question.id}`}
                    value={option.id}
                    className="mt-0.5 shrink-0"
                  />
                  <span>
                    <span className="font-mono font-medium">
                      {option.letter})
                    </span>{" "}
                    {option.text}
                  </span>
                </label>
              ))}
            </fieldset>
          </article>
        ))}

        {state.error ? (
          <p role="alert" className={alertErrorClassName}>
            {state.error}
          </p>
        ) : null}

        <button
          type="button"
          disabled={isPending}
          onClick={() => setConfirmOpen(true)}
          className={cn(buttonPrimaryClassName, "w-full sm:w-auto")}>
          {isPending ? "Submitting..." : "Submit quiz"}
        </button>

        <ConfirmDialog
          open={confirmOpen}
          title="Submit quiz?"
          description="You can't change your answers after submitting."
          confirmLabel={isPending ? "Submitting..." : "Submit"}
          cancelLabel="Keep reviewing"
          isPending={isPending}
          onConfirm={() => {
            setConfirmOpen(false);
            formRef.current?.requestSubmit();
          }}
          onCancel={() => {
            if (!isPending) {
              setConfirmOpen(false);
            }
          }}
        />
      </form>
    </div>
  );
}
