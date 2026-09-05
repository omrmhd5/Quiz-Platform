"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/components/providers/locale-provider";
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
  cn,
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
  labels: Record<"submitted" | "inProgress" | "didntFinish", string>,
) {
  return resolveAttemptStatus(sessionStatus, attemptStatus, labels);
}

export function StudentHistoryTable({ history }: StudentHistoryTableProps) {
  const router = useRouter();
  const { locale } = useAppLocale();
  const t = useTranslations("history");
  const tDashboard = useTranslations("dashboard");
  const tStudents = useTranslations("students");
  const tStatus = useTranslations("status");

  function handlePageChange(page: number) {
    router.push(`/teacher/students/${history.studentId}/history?page=${page}`);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("sessionsJoined")}
          value={history.attemptCount}
          preset="joined"
        />
        <StatCard
          label={tDashboard("submitted")}
          value={history.submittedCount}
          preset="submitted"
        />
        <StatCard
          label={tDashboard("didntFinish")}
          value={history.didntFinishCount}
          preset="didntFinish"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("highestScore")}
          value={
            history.highestScore !== null ? `${history.highestScore}%` : "—"
          }
          preset="highestScore"
        />
        <StatCard
          label={t("averageScore")}
          value={
            history.averageScore !== null ? `${history.averageScore}%` : "—"
          }
          preset="averageScore"
        />
        <StatCard
          label={t("lowestScore")}
          value={history.lowestScore !== null ? `${history.lowestScore}%` : "—"}
          preset="lowestScore"
        />
      </div>

      <div className={`${panelClassName} space-y-4`}>
        <SectionIntro
          title={tDashboard("quizStats")}
          description={
            history.submittedCount === 1
              ? tDashboard("quizStatsDescription", {
                  count: history.submittedCount,
                })
              : tDashboard("quizStatsDescriptionPlural", {
                  count: history.submittedCount,
                })
          }
        />
        {history.submittedCount === 0 ? (
          <p className={emptyStateClassName}>{tDashboard("noSubmitted")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label={tDashboard("totalCorrect")}
              value={history.totalCorrect}
              preset="correct"
            />
            <StatCard
              label={tDashboard("totalWrong")}
              value={history.totalWrong}
              preset="wrong"
            />
            <StatCard
              label={tDashboard("totalSkipped")}
              value={history.totalSkipped}
              preset="skipped"
            />
          </div>
        )}
      </div>

      {history.totalAttempts === 0 ? (
        <p className={emptyStateClassName}>{t("noAttempts")}</p>
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
                    {tDashboard("quiz")}
                  </th>
                  <th
                    scope="col"
                    className={cn(
                      tableHeadCellClassName,
                      "hidden sm:table-cell",
                    )}>
                    {tDashboard("sessionFallback")}
                  </th>
                  <th scope="col" className={tableHeadCellClassName}>
                    {tDashboard("colStatus")}
                  </th>
                  <th scope="col" className={tableHeadCellClassName}>
                    {tDashboard("averageScore")}
                  </th>
                  <th
                    scope="col"
                    className={cn(
                      tableHeadCellClassName,
                      "hidden md:table-cell",
                    )}>
                    {tDashboard("correct")}
                  </th>
                  <th
                    scope="col"
                    className={cn(
                      tableHeadCellClassName,
                      "hidden md:table-cell",
                    )}>
                    {tDashboard("wrong")}
                  </th>
                  <th
                    scope="col"
                    className={cn(
                      tableHeadCellClassName,
                      "hidden lg:table-cell",
                    )}>
                    {tDashboard("skipped")}
                  </th>
                  <th scope="col" className={tableHeadCellClassName}>
                    {tStudents("colActions")}
                  </th>
                </tr>
              </thead>
              <tbody className={tableBodyClassName}>
                {history.attempts.map((attempt) => {
                  const status = getAttemptStatusLabel(
                    attempt.sessionStatus,
                    attempt.status,
                    {
                      submitted: tStatus("submitted"),
                      inProgress: tStatus("inProgress"),
                      didntFinish: tStatus("didntFinish"),
                    },
                  );

                  return (
                    <TableRow key={attempt.attemptId}>
                      <TableCell className="max-w-[9rem] font-medium text-zinc-900 sm:max-w-none">
                        <span className="line-clamp-2 sm:line-clamp-none">
                          {attempt.quizTitle}
                        </span>
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap text-zinc-600 sm:table-cell">
                        {formatSessionDateTime(attempt.launchedAt, locale)}
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
                      <TableCell className="hidden tabular-nums text-zinc-700 md:table-cell">
                        {attempt.correctCount ?? "—"}
                      </TableCell>
                      <TableCell className="hidden tabular-nums text-zinc-700 md:table-cell">
                        {attempt.wrongCount ?? "—"}
                      </TableCell>
                      <TableCell className="hidden tabular-nums text-zinc-700 lg:table-cell">
                        {attempt.unansweredCount ?? "—"}
                      </TableCell>
                      <TableCell>
                        <ActionLink
                          action="view"
                          label={t("viewSession")}
                          compact
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
