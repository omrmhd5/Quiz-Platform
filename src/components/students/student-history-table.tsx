"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PaginationControls } from "@/components/pagination-controls";
import { SectionIntro } from "@/components/section-intro";
import { StatDisplay } from "@/components/stat-display";
import { StatusBadge, TableCell, TableRow } from "@/components/data-table";
import { formatSessionDateTime } from "@/lib/session-format";
import type { StudentHistoryView } from "@/lib/student-history";
import { STUDENTS_PAGE_SIZE } from "@/lib/pagination";
import {
  buttonSecondaryClassName,
  cn,
  emptyStateClassName,
  panelClassName,
  statCardClassName,
  tableBodyClassName,
  tableCellClassName,
  tableClassName,
  tableHeadCellClassName,
  tableHeadClassName,
  tableHeadRowClassName,
  tableShellClassName,
} from "@/lib/utils";

type StudentHistoryTableProps = {
  history: StudentHistoryView;
};

function getAttemptStatusLabel(
  sessionStatus: StudentHistoryView["attempts"][number]["sessionStatus"],
  attemptStatus: StudentHistoryView["attempts"][number]["status"],
) {
  if (attemptStatus === "submitted") {
    return { label: "Submitted", className: "ui-badge ui-badge-success" };
  }

  if (sessionStatus === "closed") {
    return { label: "Didn't finish", className: "ui-badge ui-badge-danger" };
  }

  return { label: "In progress", className: "ui-badge ui-badge-progress" };
}

export function StudentHistoryTable({ history }: StudentHistoryTableProps) {
  const router = useRouter();

  function handlePageChange(page: number) {
    router.push(`/teacher/students/${history.studentId}/history?page=${page}`);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className={statCardClassName}>
          <StatDisplay label="Sessions joined" value={history.attemptCount} />
        </div>
        <div className={statCardClassName}>
          <StatDisplay label="Submitted" value={history.submittedCount} />
        </div>
        <div className={statCardClassName}>
          <StatDisplay label="Didn't finish" value={history.didntFinishCount} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className={statCardClassName}>
          <StatDisplay
            label="Highest score"
            value={
              history.highestScore !== null ? `${history.highestScore}%` : "—"
            }
          />
        </div>
        <div className={statCardClassName}>
          <StatDisplay
            label="Average score"
            value={
              history.averageScore !== null ? `${history.averageScore}%` : "—"
            }
          />
        </div>
        <div className={statCardClassName}>
          <StatDisplay
            label="Lowest score"
            value={
              history.lowestScore !== null ? `${history.lowestScore}%` : "—"
            }
          />
        </div>
      </div>

      <div className={`${panelClassName} space-y-4`}>
        <SectionIntro
          title="Quiz stats"
          description={`Totals across ${history.submittedCount} submitted attempt${history.submittedCount === 1 ? "" : "s"}.`}
        />
        {history.submittedCount === 0 ? (
          <p className={emptyStateClassName}>No submitted quizzes yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className={statCardClassName}>
              <StatDisplay label="Total correct" value={history.totalCorrect} />
            </div>
            <div className={statCardClassName}>
              <StatDisplay label="Total wrong" value={history.totalWrong} />
            </div>
            <div className={statCardClassName}>
              <StatDisplay label="Total skipped" value={history.totalSkipped} />
            </div>
          </div>
        )}
      </div>

      {history.totalAttempts === 0 ? (
        <p className={emptyStateClassName}>
          No quiz attempts yet. History will appear after this student joins a
          session.
        </p>
      ) : (
        <div className={`${panelClassName} space-y-4`}>
          <PaginationControls
            page={history.page}
            pageCount={history.pageCount}
            totalItems={history.totalAttempts}
            pageSize={STUDENTS_PAGE_SIZE}
            onPageChange={handlePageChange}
          />

          <div className={tableShellClassName}>
            <table className={tableClassName}>
              <thead className={tableHeadClassName}>
                <tr className={tableHeadRowClassName}>
                  <th scope="col" className={tableHeadCellClassName}>
                    Quiz
                  </th>
                  <th scope="col" className={tableHeadCellClassName}>
                    Session
                  </th>
                  <th scope="col" className={tableHeadCellClassName}>
                    Status
                  </th>
                  <th scope="col" className={tableHeadCellClassName}>
                    Score
                  </th>
                  <th scope="col" className={tableHeadCellClassName}>
                    Correct
                  </th>
                  <th scope="col" className={tableHeadCellClassName}>
                    Wrong
                  </th>
                  <th scope="col" className={tableHeadCellClassName}>
                    Skipped
                  </th>
                  <th scope="col" className={tableHeadCellClassName}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={tableBodyClassName}>
                {history.attempts.map((attempt) => {
                  const status = getAttemptStatusLabel(
                    attempt.sessionStatus,
                    attempt.status,
                  );

                  return (
                    <TableRow key={attempt.attemptId}>
                      <TableCell className="font-medium text-zinc-900">
                        {attempt.quizTitle}
                      </TableCell>
                      <TableCell className="text-zinc-600">
                        {formatSessionDateTime(attempt.launchedAt)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          className={cn("capitalize", status.className)}>
                          {status.label}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="tabular-nums text-zinc-900">
                        {attempt.scorePercent !== null
                          ? `${attempt.scorePercent}%`
                          : "—"}
                      </TableCell>
                      <TableCell className="tabular-nums text-zinc-700">
                        {attempt.correctCount ?? "—"}
                      </TableCell>
                      <TableCell className="tabular-nums text-zinc-700">
                        {attempt.wrongCount ?? "—"}
                      </TableCell>
                      <TableCell className="tabular-nums text-zinc-700">
                        {attempt.unansweredCount ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/teacher/quizzes/${attempt.quizId}#session-${attempt.sessionId}`}
                          className={cn(buttonSecondaryClassName, "ui-btn-sm")}>
                          View session
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </table>
          </div>

          <PaginationControls
            page={history.page}
            pageCount={history.pageCount}
            totalItems={history.totalAttempts}
            pageSize={STUDENTS_PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
