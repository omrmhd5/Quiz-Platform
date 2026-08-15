"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PaginationControls } from "@/components/pagination-controls";
import { SectionIntro } from "@/components/section-intro";
import { StatCard } from "@/components/stat-display";
import { ActionLink } from "@/components/ui/action-control";
import {
  AttemptStatusBadge,
  resolveAttemptStatus,
} from "@/components/ui/attempt-status-badge";
import { TableCell, TableRow } from "@/components/data-table";
import { formatSessionDateTime } from "@/lib/session-format";
import type { StudentHistoryView } from "@/lib/student-history";
import { STUDENTS_PAGE_SIZE } from "@/lib/pagination";
import {
  emptyStateClassName,
  panelClassName,
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
  return resolveAttemptStatus(sessionStatus, attemptStatus);
}

export function StudentHistoryTable({ history }: StudentHistoryTableProps) {
  const router = useRouter();

  function handlePageChange(page: number) {
    router.push(`/teacher/students/${history.studentId}/history?page=${page}`);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Sessions joined"
          value={history.attemptCount}
          preset="joined"
        />
        <StatCard
          label="Submitted"
          value={history.submittedCount}
          preset="submitted"
        />
        <StatCard
          label="Didn't finish"
          value={history.didntFinishCount}
          preset="didntFinish"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Highest score"
          value={
            history.highestScore !== null ? `${history.highestScore}%` : "—"
          }
          preset="highestScore"
        />
        <StatCard
          label="Average score"
          value={
            history.averageScore !== null ? `${history.averageScore}%` : "—"
          }
          preset="averageScore"
        />
        <StatCard
          label="Lowest score"
          value={
            history.lowestScore !== null ? `${history.lowestScore}%` : "—"
          }
          preset="lowestScore"
        />
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
            <StatCard
              label="Total correct"
              value={history.totalCorrect}
              preset="correct"
            />
            <StatCard
              label="Total wrong"
              value={history.totalWrong}
              preset="wrong"
            />
            <StatCard
              label="Total skipped"
              value={history.totalSkipped}
              preset="skipped"
            />
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
                        <AttemptStatusBadge
                          kind={status.kind}
                          label={status.label}
                          className={status.className}
                        />
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
                        <ActionLink
                          action="view"
                          label="View session"
                          href={`/teacher/quizzes/${attempt.quizId}#session-${attempt.sessionId}`}
                        />
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
