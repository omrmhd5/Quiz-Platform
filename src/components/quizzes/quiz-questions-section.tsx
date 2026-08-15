"use client";

import { useEffect, useMemo, useState } from "react";
import { ContentModal } from "@/components/content-modal";
import { PaginationControls } from "@/components/pagination-controls";
import { ActionButton } from "@/components/ui/action-control";
import { QUESTIONS_PAGE_SIZE, paginateSlice } from "@/lib/pagination";
import { cn, panelClassName } from "@/lib/utils";

export type QuizQuestionView = {
  id: string;
  prompt: string;
  options: Array<{
    id: string;
    text: string;
    orderIndex: number;
    isCorrect: boolean;
  }>;
};

type QuizQuestionsSectionProps = {
  questions: QuizQuestionView[];
};

export function QuizQuestionsSection({ questions }: QuizQuestionsSectionProps) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!open) {
      setPage(1);
    }
  }, [open]);

  const pagination = useMemo(
    () => paginateSlice(questions, page, QUESTIONS_PAGE_SIZE),
    [page, questions],
  );

  const pageOffset = (pagination.page - 1) * QUESTIONS_PAGE_SIZE;

  return (
    <>
      <div
        className={`${panelClassName} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Questions</h2>
          <p className="mt-1 text-sm text-zinc-600">
            {questions.length} question{questions.length === 1 ? "" : "s"} ·
            answer key for this quiz
          </p>
        </div>
        <ActionButton action="answerKey" onClick={() => setOpen(true)} />
      </div>

      <ContentModal
        open={open}
        title="Answer key"
        description={`${questions.length} question${questions.length === 1 ? "" : "s"} · students see shuffled order`}
        size="lg"
        onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <PaginationControls
            page={pagination.page}
            pageCount={pagination.pageCount}
            totalItems={questions.length}
            pageSize={QUESTIONS_PAGE_SIZE}
            onPageChange={setPage}
          />

          {pagination.items.map((question, index) => {
            const correctOption = question.options.find(
              (option) => option.isCorrect,
            );
            const questionNumber = pageOffset + index + 1;

            return (
              <article
                key={question.id}
                className={`${panelClassName} space-y-3`}>
                <h3 className="font-medium leading-snug text-zinc-900">
                  {questionNumber}. {question.prompt}
                </h3>
                <ul className="space-y-2">
                  {question.options.map((option) => {
                    const letter = String.fromCharCode(65 + option.orderIndex);
                    const isCorrect = option.id === correctOption?.id;

                    return (
                      <li
                        key={option.id}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-sm",
                          isCorrect
                            ? "border-green-200 bg-green-50 text-green-900"
                            : "border-zinc-200 bg-zinc-50 text-zinc-800",
                        )}>
                        <span className="font-mono font-medium">{letter})</span>{" "}
                        {option.text}
                        {isCorrect ? (
                          <span className="ml-2 text-xs font-medium uppercase tracking-wide text-green-700">
                            Correct
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}

          <PaginationControls
            page={pagination.page}
            pageCount={pagination.pageCount}
            totalItems={questions.length}
            pageSize={QUESTIONS_PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </ContentModal>
    </>
  );
}
