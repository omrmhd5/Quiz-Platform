"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PaginationControls } from "@/components/pagination-controls";
import { LaunchQuizButton } from "@/components/sessions/launch-quiz-button";
import type { ActiveSessionInfo } from "@/lib/sessions";
import { QUIZZES_PAGE_SIZE, paginateSlice } from "@/lib/pagination";
import { buttonSecondaryClassName, cn, panelClassName } from "@/lib/utils";

type QuizRow = {
  id: string;
  title: string;
  status: string;
  questionCount: number;
  createdAt: Date;
  sessionCount: number;
};

type QuizzesTableProps = {
  quizzes: QuizRow[];
  activeSession: ActiveSessionInfo | null;
};

export function QuizzesTable({ quizzes, activeSession }: QuizzesTableProps) {
  const [page, setPage] = useState(1);

  const pagination = useMemo(
    () => paginateSlice(quizzes, page, QUIZZES_PAGE_SIZE),
    [page, quizzes],
  );

  return (
    <div className={`${panelClassName} space-y-4 overflow-x-auto`}>
      <PaginationControls
        page={pagination.page}
        pageCount={pagination.pageCount}
        totalItems={quizzes.length}
        pageSize={QUIZZES_PAGE_SIZE}
        onPageChange={setPage}
      />

      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead>
          <tr className="text-left text-zinc-500">
            <th className="px-3 py-2 font-medium">Title</th>
            <th className="px-3 py-2 font-medium">Questions</th>
            <th className="px-3 py-2 font-medium">Results</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Created</th>
            <th className="px-3 py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {pagination.items.map((quiz) => {
            const isLive = activeSession?.quizId === quiz.id;

            return (
              <tr key={quiz.id} className="ui-table-row">
                <td className="px-3 py-3 font-medium text-zinc-900">
                  <Link
                    href={`/teacher/quizzes/${quiz.id}`}
                    className="rounded-sm underline decoration-zinc-300 underline-offset-2 transition-colors hover:text-zinc-600 hover:decoration-zinc-500">
                    {quiz.title}
                  </Link>
                </td>
                <td className="px-3 py-3 tabular-nums text-zinc-700">
                  {quiz.questionCount}
                </td>
                <td className="px-3 py-3 tabular-nums text-zinc-700">
                  {quiz.sessionCount}
                </td>
                <td className="px-3 py-3">
                  {isLive ? (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Live
                    </span>
                  ) : (
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium capitalize text-zinc-700">
                      {quiz.status}
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 text-zinc-600">
                  {quiz.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <LaunchQuizButton
                      quizId={quiz.id}
                      quizTitle={quiz.title}
                      questionCount={quiz.questionCount}
                      activeSession={activeSession}
                    />
                    <Link
                      href={`/teacher/quizzes/${quiz.id}`}
                      className={cn(buttonSecondaryClassName, "ui-btn-sm")}>
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <PaginationControls
        page={pagination.page}
        pageCount={pagination.pageCount}
        totalItems={quizzes.length}
        pageSize={QUIZZES_PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
