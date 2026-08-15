import Link from "next/link";
import { DashboardAttemptHighlights } from "@/components/dashboard/dashboard-attempt-highlights";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { SectionIntro } from "@/components/section-intro";
import { StatDisplay } from "@/components/stat-display";
import { StatusBadge, TableCell, TableRow } from "@/components/data-table";
import { ActiveSessionBanner } from "@/components/sessions/active-session-banner";
import {
  formatSessionDateTime,
  sessionStatusBadgeClass,
} from "@/lib/session-format";
import { DASHBOARD_RECENT_SESSIONS, type DashboardView } from "@/lib/dashboard";
import type { ActiveSessionInfo } from "@/lib/sessions";
import {
  buttonSecondaryClassName,
  cn,
  emptyStateClassName,
  linkClassName,
  pageDescriptionClassName,
  pageTitleClassName,
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
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={pageTitleClassName}>Dashboard</h1>
          <p className={pageDescriptionClassName}>
            All-time overview of classroom activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/teacher/students" className={buttonSecondaryClassName}>
            Manage students
          </Link>
          <Link href="/teacher/quizzes" className={buttonSecondaryClassName}>
            Manage quizzes
          </Link>
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
          <div className={statCardClassName}>
            <StatDisplay
              label="Registered students"
              value={stats.studentCount}
            />
          </div>
          <div className={statCardClassName}>
            <StatDisplay label="Total quizzes" value={stats.quizCount} />
          </div>
          <div className={statCardClassName}>
            <StatDisplay label="Total sessions" value={stats.sessionCount} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className={statCardClassName}>
            <StatDisplay label="Submitted" value={stats.submittedCount} />
          </div>
          <div className={statCardClassName}>
            <StatDisplay
              label="In progress"
              value={stats.liveInProgressCount}
            />
          </div>
          <div className={statCardClassName}>
            <StatDisplay label="Didn't finish" value={stats.didntFinishCount} />
          </div>
          <div className={statCardClassName}>
            <StatDisplay
              label="Average score"
              value={
                stats.overallAverageScore !== null
                  ? `${stats.overallAverageScore}%`
                  : "—"
              }
            />
          </div>
        </div>
      </div>

      <div className={`${panelClassName} space-y-4`}>
        <SectionIntro
          title="Quiz stats"
          description={`Totals across ${stats.submittedCount} submitted attempt${stats.submittedCount === 1 ? "" : "s"}.`}
        />
        {stats.submittedCount === 0 ? (
          <p className={emptyStateClassName}>No submitted quizzes yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className={statCardClassName}>
              <StatDisplay label="Total correct" value={stats.totalCorrect} />
            </div>
            <div className={statCardClassName}>
              <StatDisplay label="Total wrong" value={stats.totalWrong} />
            </div>
            <div className={statCardClassName}>
              <StatDisplay label="Total skipped" value={stats.totalSkipped} />
            </div>
          </div>
        )}
      </div>

      <DashboardCharts stats={stats} />

      <div className={`${panelClassName} space-y-4`}>
        <div className="flex items-start justify-between gap-3">
          <SectionIntro
            title="Recent sessions"
            description={`Most recent ${DASHBOARD_RECENT_SESSIONS} quiz runs.`}
            className="mb-0 min-w-0 flex-1"
          />
          <Link
            href="/teacher/quizzes"
            className={cn(linkClassName, "shrink-0")}>
            All quizzes
          </Link>
        </div>

        {stats.recentSessions.length === 0 ? (
          <p className={emptyStateClassName}>
            No sessions yet. Launch a quiz to see activity here.
          </p>
        ) : (
          <div className={tableShellClassName}>
            <table className={tableClassName}>
              <thead className={tableHeadClassName}>
                <tr className={tableHeadRowClassName}>
                  <th scope="col" className={tableHeadCellClassName}>
                    Quiz
                  </th>
                  <th scope="col" className={tableHeadCellClassName}>
                    When
                  </th>
                  <th scope="col" className={tableHeadCellClassName}>
                    Status
                  </th>
                  <th scope="col" className={tableHeadCellClassName}>
                    Joined
                  </th>
                  <th scope="col" className={tableHeadCellClassName}>
                    Avg
                  </th>
                </tr>
              </thead>
              <tbody className={tableBodyClassName}>
                {stats.recentSessions.map((session) => (
                  <TableRow key={session.sessionId}>
                    <TableCell className="font-medium text-zinc-900">
                      <Link
                        href={`/teacher/quizzes/${session.quizId}#session-${session.sessionId}`}
                        className={linkClassName}>
                        {session.quizTitle}
                      </Link>
                    </TableCell>
                    <TableCell className="text-zinc-600">
                      {formatSessionDateTime(session.launchedAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        className={cn(
                          "capitalize",
                          sessionStatusBadgeClass(session.status),
                        )}>
                        {session.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="tabular-nums text-zinc-700">
                      {session.joinedCount}
                      <span className="text-zinc-400">
                        {" "}
                        / {session.submittedCount} submitted
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
