"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PaginationControls } from "@/components/pagination-controls";
import type { AttemptQuizView } from "@/lib/attempts";
import { submitAttemptInitialState } from "@/lib/attempts";
import { QUESTIONS_PAGE_SIZE, paginateSlice } from "@/lib/pagination";
import {
  alertErrorClassName,
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  cn,
  enterClassName,
  optionLabelClassName,
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
  const [page, setPage] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const pagination = useMemo(
    () => paginateSlice(quiz.questions, page, QUESTIONS_PAGE_SIZE),
    [page, quiz.questions],
  );

  function handleAnswerChange(questionId: string, optionId: string) {
    setAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }));
  }

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
          <input
            key={question.id}
            type="hidden"
            name={`answer-${question.id}`}
            value={answers[question.id] ?? ""}
          />
        ))}

        <PaginationControls
          page={pagination.page}
          pageCount={pagination.pageCount}
          totalItems={quiz.questions.length}
          pageSize={QUESTIONS_PAGE_SIZE}
          onPageChange={setPage}
        />

        {pagination.items.map((question) => (
          <article key={question.id} className={`${panelClassName} space-y-4`}>
            <h2 className="text-base font-medium leading-snug text-zinc-900">
              {question.number}. {question.prompt}
            </h2>

            <fieldset className="space-y-2">
              <legend className="sr-only">Choose an answer</legend>
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className={optionLabelClassName}>
                  <input
                    type="radio"
                    value={option.id}
                    checked={answers[question.id] === option.id}
                    onChange={() => handleAnswerChange(question.id, option.id)}
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

        <PaginationControls
          page={pagination.page}
          pageCount={pagination.pageCount}
          totalItems={quiz.questions.length}
          pageSize={QUESTIONS_PAGE_SIZE}
          onPageChange={setPage}
        />

        {state.error ? (
          <p role="alert" className={alertErrorClassName}>
            {state.error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {pagination.page > 1 ? (
            <button
              type="button"
              onClick={() => setPage((current) => current - 1)}
              className={cn(buttonSecondaryClassName, "sm:w-auto")}>
              Previous questions
            </button>
          ) : null}
          {pagination.page < pagination.pageCount ? (
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              className={cn(buttonSecondaryClassName, "sm:w-auto")}>
              Next questions
            </button>
          ) : null}
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirmOpen(true)}
            className={cn(buttonPrimaryClassName, "w-full sm:ml-auto sm:w-auto")}>
            {isPending ? "Submitting..." : "Submit quiz"}
          </button>
        </div>

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
