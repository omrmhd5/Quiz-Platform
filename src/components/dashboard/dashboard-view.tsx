"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/components/providers/locale-provider";
import { DashboardAttemptHighlights } from "@/components/dashboard/dashboard-attempt-highlights";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { SectionIntro } from "@/components/section-intro";
import { StatCard } from "@/components/stat-display";
import { ActionLink } from "@/components/ui/action-control";
import { StatusBadge, TableCell, TableRow } from "@/components/data-table";
import { ActiveSessionBanner } from "@/components/sessions/active-session-banner";
import {
  formatSessionDateTime,
  sessionStatusBadgeClass,
} from "@/lib/session-format";
import { DASHBOARD_RECENT_SESSIONS, type DashboardView } from "@/lib/dashboard";
import type { ActiveSessionInfo } from "@/lib/sessions";
import {
  cn,
  emptyStateClassName,
  linkClassName,
  pageDescriptionClassName,
  pageTitleClassName,
  panelClassName,
  tableBodyClassName,
  tableCellClassName,
  tableClassName,
  tableHeadCellClassName,
  tableHeadClassName,
  tableHeadRowClassName,
  tableShellClassName,
} from "@/lib/utils";

type DashboardViewProps = {
  stats: DashboardView;
  activeSession: ActiveSessionInfo | null;
  joinUrl: string;
  joinedCount: number;
};

export function DashboardView({
  stats,
  activeSession,
  joinUrl,
  joinedCount,
}: DashboardViewProps) {
  const t = useTranslations("dashboard");
  const tSession = useTranslations("session");
  const { locale } = useAppLocale();
  return (
    <div className="space-y-6 sm:space-y-8">
      <div id="dashboard-overview" className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={pageTitleClassName}>{t("title")}</h1>
          <p className={pageDescriptionClassName}>{t("subtitle")}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
          <ActionLink
            action="manageStudents"
            href="/teacher/students"
            className="w-full justify-center sm:w-auto"
          />
          <ActionLink
            action="manageQuizzes"
            href="/teacher/quizzes"
            className="w-full justify-center sm:w-auto"
          />
        </div>
      </div>

      {activeSession ? (
        <ActiveSessionBanner
          activeSession={activeSession}
          joinUrl={joinUrl}
          joinedCount={joinedCount}
        />
      ) : null}

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label={t("registeredStudents")}
            value={stats.studentCount}
            preset="students"
          />
          <StatCard
            label={t("totalQuizzes")}
            value={stats.quizCount}
            preset="quizzes"
          />
          <StatCard
            label={t("totalSessions")}
            value={stats.sessionCount}
            preset="sessions"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={t("submitted")}
            value={stats.submittedCount}
            preset="submitted"
          />
          <StatCard
            label={t("inProgress")}
            value={stats.liveInProgressCount}
            preset="inProgress"
          />
          <StatCard
            label={t("didntFinish")}
            value={stats.didntFinishCount}
            preset="didntFinish"
          />
          <StatCard
            label={t("averageScore")}
            value={
              stats.overallAverageScore !== null
                ? `${stats.overallAverageScore}%`
                : "—"
            }
            preset="averageScore"
          />
        </div>
      </div>

      <div className={`${panelClassName} space-y-4`}>
        <SectionIntro
          title={t("quizStats")}
          description={
            stats.submittedCount === 1
              ? t("quizStatsDescription", { count: stats.submittedCount })
              : t("quizStatsDescriptionPlural", { count: stats.submittedCount })
          }
        />
        {stats.submittedCount === 0 ? (
          <p className={emptyStateClassName}>{t("noSubmitted")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label={t("totalCorrect")}
              value={stats.totalCorrect}
              preset="correct"
            />
            <StatCard
              label={t("totalWrong")}
              value={stats.totalWrong}
              preset="wrong"
            />
            <StatCard
              label={t("totalSkipped")}
              value={stats.totalSkipped}
              preset="skipped"
            />
          </div>
        )}
      </div>
      </div>

      <DashboardCharts stats={stats} />

      <div id="dashboard-sessions" className={`${panelClassName} space-y-4`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <SectionIntro
            title={t("recentSessions")}
            description={t("recentSessionsDescription", {
              count: DASHBOARD_RECENT_SESSIONS,
            })}
            className="mb-0 min-w-0 flex-1"
          />
          <Link
            href="/teacher/quizzes"
            className={cn(linkClassName, "shrink-0 self-start")}>
            {t("allQuizzes")}
          </Link>
        </div>

        {stats.recentSessions.length === 0 ? (
          <p className={emptyStateClassName}>
            {t("noSessions")}
          </p>
        ) : (
          <div className={tableShellClassName}>
            <table className={tableClassName}>
              <thead className={tableHeadClassName}>
                <tr className={tableHeadRowClassName}>
                  <th scope="col" className={tableHeadCellClassName}>
                    {t("colQuiz")}
                  </th>
                  <th scope="col" className={tableHeadCellClassName}>
                    {t("colWhen")}
                  </th>
                  <th scope="col" className={tableHeadCellClassName}>
                    {t("colStatus")}
                  </th>
                  <th scope="col" className={tableHeadCellClassName}>
                    {t("colJoined")}
                  </th>
                  <th scope="col" className={tableHeadCellClassName}>
                    {t("colAverage")}
                  </th>
                </tr>
              </thead>
              <tbody className={tableBodyClassName}>
                {stats.recentSessions.map((session) => (
                  <TableRow key={session.sessionId}>
                    <TableCell className="max-w-[10rem] font-medium text-zinc-900 sm:max-w-none">
                      <Link
                        href={`/teacher/quizzes/${session.quizId}#session-${session.sessionId}`}
                        className={cn(linkClassName, "line-clamp-2 sm:line-clamp-none")}>
                        {session.quizTitle}
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-zinc-600">
                      {formatSessionDateTime(session.launchedAt, locale)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        className={cn(
                          "capitalize",
                          sessionStatusBadgeClass(session.status),
                        )}>
                        {session.status === "active"
                          ? tSession("live")
                          : session.status === "closed"
                            ? tSession("closed")
                            : tSession("waiting")}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="tabular-nums text-zinc-700">
                      {session.joinedCount}
                      <span className="block text-xs text-zinc-400 sm:inline sm:text-inherit">
                        <span className="hidden sm:inline"> / </span>
                        {session.submittedCount} {t("submitted")}
                      </span>
                    </TableCell>
                    <TableCell className="tabular-nums text-zinc-900">
                      {session.averageScore !== null
                        ? `${session.averageScore}%`
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DashboardAttemptHighlights
        topAttemptsHighest={stats.topAttemptsHighest}
        topAttemptsLowest={stats.topAttemptsLowest}
        topResultsHighest={stats.topResultsHighest}
        topResultsLowest={stats.topResultsLowest}
      />
    </div>
  );
}
