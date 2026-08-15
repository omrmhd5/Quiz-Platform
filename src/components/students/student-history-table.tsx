"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PaginationControls } from "@/components/pagination-controls";
import { formatSessionDateTime } from "@/lib/session-format";
import type { StudentHistoryView } from "@/lib/student-history";
import { STUDENTS_PAGE_SIZE, paginateSlice } from "@/lib/pagination";
import {
  buttonSecondaryClassName,
  cn,
  panelClassName,
  statCardClassName,
} from "@/lib/utils";

type StudentHistoryTableProps = {
  history: StudentHistoryView;
};

function getAttemptStatusLabel(
  sessionStatus: StudentHistoryView["attempts"][number]["sessionStatus"],
  attemptStatus: StudentHistoryView["attempts"][number]["status"],
) {
  if (attemptStatus === "submitted") {
    return { label: "Submitted", className: "bg-green-100 text-green-800" };
  }

  if (sessionStatus === "closed") {
    return { label: "Didn't finish", className: "bg-red-100 text-red-800" };
  }

  return { label: "In progress", className: "bg-amber-100 text-amber-800" };
}

export function StudentHistoryTable({ history }: StudentHistoryTableProps) {
  const [page, setPage] = useState(1);

  const pagination = useMemo(
    () => paginateSlice(history.attempts, page, STUDENTS_PAGE_SIZE),
    [history.attempts, page],
  );

  const stats = useMemo(() => {
    const submitted = history.attempts.filter(
      (attempt) => attempt.status === "submitted",
    );
    const didntFinishCount = history.attempts.filter(
      (attempt) =>
        attempt.status === "in_progress" && attempt.sessionStatus === "closed",
    ).length;
    const scores = submitted
      .map((attempt) => attempt.scorePercent)
      .filter((score): score is number => score !== null);

    const totalCorrect = submitted.reduce(
      (sum, attempt) => sum + (attempt.correctCount ?? 0),
      0,
    );
    const totalWrong = submitted.reduce(
      (sum, attempt) => sum + (attempt.wrongCount ?? 0),
      0,
    );
    const totalSkipped = submitted.reduce(
      (sum, attempt) => sum + (attempt.unansweredCount ?? 0),
      0,
    );

    return {
      didntFinishCount,
      highestScore:
        scores.length > 0 ? Math.round(Math.max(...scores) * 10) / 10 : null,
      lowestScore:
        scores.length > 0 ? Math.round(Math.min(...scores) * 10) / 10 : null,
      totalCorrect,
      totalWrong,
      totalSkipped,
    };
  }, [history.attempts]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className={statCardClassName}>
          <p className="text-sm text-zinc-600">Sessions joined</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
            {history.attemptCount}
          </p>
        </div>
        <div className={statCardClassName}>
          <p className="text-sm text-zinc-600">Submitted</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
            {history.submittedCount}
          </p>
        </div>
        <div className={statCardClassName}>
          <p className="text-sm text-zinc-600">Didn&apos;t finish</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
            {stats.didntFinishCount}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className={statCardClassName}>
          <p className="text-sm text-zinc-600">Highest score</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
            {stats.highestScore !== null ? `${stats.highestScore}%` : "—"}
          </p>
        </div>
        <div className={statCardClassName}>
          <p className="text-sm text-zinc-600">Average score</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
            {history.averageScore !== null ? `${history.averageScore}%` : "—"}
          </p>
        </div>
        <div className={statCardClassName}>
          <p className="text-sm text-zinc-600">Lowest score</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
            {stats.lowestScore !== null ? `${stats.lowestScore}%` : "—"}
          </p>
        </div>
      </div>

      <div className={`${panelClassName} space-y-4`}>
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Quiz stats</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Totals across {history.submittedCount} submitted attempt
            {history.submittedCount === 1 ? "" : "s"}.
          </p>
        </div>
        {history.submittedCount === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-600">
            No submitted quizzes yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className={statCardClassName}>
              <p className="text-sm text-zinc-600">Total correct</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
                {stats.totalCorrect}
              </p>
            </div>
            <div className={statCardClassName}>
              <p className="text-sm text-zinc-600">Total wrong</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
                {stats.totalWrong}
              </p>
            </div>
            <div className={statCardClassName}>
              <p className="text-sm text-zinc-600">Total skipped</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
                {stats.totalSkipped}
              </p>
            </div>
          </div>
        )}
      </div>

      {history.attempts.length === 0 ? (
        <div className={`${panelClassName} border-dashed text-center`}>
          <p className="text-sm text-zinc-600">
            No quiz attempts yet. History will appear after this student joins a
            session.
          </p>
        </div>
      ) : (
        <div className={`${panelClassName} space-y-4 overflow-x-auto`}>
          <PaginationControls
            page={pagination.page}
            pageCount={pagination.pageCount}
            totalItems={history.attempts.length}
            pageSize={STUDENTS_PAGE_SIZE}
            onPageChange={setPage}
          />

          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="px-3 py-2 font-medium">Quiz</th>
                <th className="px-3 py-2 font-medium">Session</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Score</th>
                <th className="px-3 py-2 font-medium">Correct</th>
                <th className="px-3 py-2 font-medium">Wrong</th>
                <th className="px-3 py-2 font-medium">Skipped</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {pagination.items.map((attempt) => {
                const status = getAttemptStatusLabel(
                  attempt.sessionStatus,
                  attempt.status,
                );

                return (
                  <tr key={attempt.attemptId} className="ui-table-row">
                    <td className="px-3 py-3 font-medium text-zinc-900">
                      {attempt.quizTitle}
                    </td>
                    <td className="px-3 py-3 text-zinc-600">
                      {formatSessionDateTime(attempt.launchedAt)}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          status.className,
                        )}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-zinc-900">
                      {attempt.scorePercent !== null
                        ? `${attempt.scorePercent}%`
                        : "—"}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-zinc-700">
                      {attempt.correctCount ?? "—"}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-zinc-700">
                      {attempt.wrongCount ?? "—"}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-zinc-700">
                      {attempt.unansweredCount ?? "—"}
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/teacher/quizzes/${attempt.quizId}#session-${attempt.sessionId}`}
                        className={cn(buttonSecondaryClassName, "ui-btn-sm")}>
                        View session
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <PaginationControls
            page={pagination.page}
            pageCount={pagination.pageCount}
            totalItems={history.attempts.length}
            pageSize={STUDENTS_PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
