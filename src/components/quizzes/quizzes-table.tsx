"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PaginationControls } from "@/components/pagination-controls";
import { LaunchQuizButton } from "@/components/sessions/launch-quiz-button";
import { ActionLink } from "@/components/ui/action-control";
import type { ActiveSessionInfo } from "@/lib/sessions";
import { QUIZZES_PAGE_SIZE, paginateSlice } from "@/lib/pagination";
import {
  cn,
  linkClassName,
  panelClassName,
  tableBodyClassName,
  tableCellClassName,
  tableClassName,
  tableHeadCellClassName,
  tableHeadClassName,
  tableHeadRowClassName,
  tableShellClassName,
} from "@/lib/utils";

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
    <div className={`${panelClassName} space-y-4`}>
      <PaginationControls
        page={pagination.page}
        pageCount={pagination.pageCount}
        totalItems={quizzes.length}
        pageSize={QUIZZES_PAGE_SIZE}
        onPageChange={setPage}
      />

      <div className={tableShellClassName}>
      <table className={tableClassName}>
        <thead className={tableHeadClassName}>
          <tr className={tableHeadRowClassName}>
            <th scope="col" className={tableHeadCellClassName}>Title</th>
            <th scope="col" className={tableHeadCellClassName}>Questions</th>
            <th scope="col" className={tableHeadCellClassName}>Results</th>
            <th scope="col" className={tableHeadCellClassName}>Status</th>
            <th scope="col" className={cn(tableHeadCellClassName, "hidden md:table-cell")}>Created</th>
            <th scope="col" className={tableHeadCellClassName}>Actions</th>
          </tr>
        </thead>
        <tbody className={tableBodyClassName}>
          {pagination.items.map((quiz) => {
            const isLive = activeSession?.quizId === quiz.id;

            return (
              <tr key={quiz.id} className="ui-table-row">
                <td className={cn(tableCellClassName, "max-w-[10rem] font-medium text-zinc-900 sm:max-w-none")}>
                  <Link href={`/teacher/quizzes/${quiz.id}`} className={cn(linkClassName, "line-clamp-2 sm:line-clamp-none")}>
                    {quiz.title}
                  </Link>
                </td>
                <td className={cn(tableCellClassName, "tabular-nums text-zinc-700")}>
                  {quiz.questionCount}
                </td>
                <td className={cn(tableCellClassName, "tabular-nums text-zinc-700")}>
                  {quiz.sessionCount}
                </td>
                <td className={tableCellClassName}>
                  {isLive ? (
                    <span className="ui-badge ui-badge-active">Live</span>
                  ) : (
                    <span className="ui-badge ui-badge-closed capitalize">
                      {quiz.status}
                    </span>
                  )}
                </td>
                <td className={cn(tableCellClassName, "hidden whitespace-nowrap text-zinc-600 md:table-cell")}>
                  {quiz.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className={tableCellClassName}>
                  <div className="flex flex-wrap gap-2">
                    <LaunchQuizButton
                      quizId={quiz.id}
                      quizTitle={quiz.title}
                      questionCount={quiz.questionCount}
                      activeSession={activeSession}
                      compact
                    />
                    <ActionLink
                      action="view"
                      href={`/teacher/quizzes/${quiz.id}`}
                      compact
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

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
