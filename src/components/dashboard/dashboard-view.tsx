import Link from "next/link";
import { DashboardAttemptHighlights } from "@/components/dashboard/dashboard-attempt-highlights";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
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
  linkClassName,
  pageDescriptionClassName,
  pageTitleClassName,
  panelClassName,
  statCardClassName,
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
            <p className="text-sm text-zinc-600">Registered students</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
              {stats.studentCount}
            </p>
          </div>
          <div className={statCardClassName}>
            <p className="text-sm text-zinc-600">Total quizzes</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
              {stats.quizCount}
            </p>
          </div>
          <div className={statCardClassName}>
            <p className="text-sm text-zinc-600">Total sessions</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
              {stats.sessionCount}
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className={statCardClassName}>
            <p className="text-sm text-zinc-600">Submitted</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
              {stats.submittedCount}
            </p>
          </div>
          <div className={statCardClassName}>
            <p className="text-sm text-zinc-600">In progress</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
              {stats.liveInProgressCount}
            </p>
          </div>
          <div className={statCardClassName}>
            <p className="text-sm text-zinc-600">Didn&apos;t finish</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
              {stats.didntFinishCount}
            </p>
          </div>
          <div className={statCardClassName}>
            <p className="text-sm text-zinc-600">Average score</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
              {stats.overallAverageScore !== null
                ? `${stats.overallAverageScore}%`
                : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className={`${panelClassName} space-y-4`}>
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Quiz stats</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Totals across {stats.submittedCount} submitted attempt
            {stats.submittedCount === 1 ? "" : "s"}.
          </p>
        </div>
        {stats.submittedCount === 0 ? (
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

      <DashboardCharts stats={stats} />

      <div className={`${panelClassName} space-y-4`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Recent sessions
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Most recent {DASHBOARD_RECENT_SESSIONS} quiz runs.
            </p>
          </div>
          <Link href="/teacher/quizzes" className={linkClassName}>
            All quizzes
          </Link>
        </div>

        {stats.recentSessions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-600">
            No sessions yet. Launch a quiz to see activity here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50">
                <tr className="text-left text-zinc-500">
                  <th className="px-3 py-2 font-medium">Quiz</th>
                  <th className="px-3 py-2 font-medium">When</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Joined</th>
                  <th className="px-3 py-2 font-medium">Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {stats.recentSessions.map((session) => (
                  <tr key={session.sessionId} className="ui-table-row">
                    <td className="px-3 py-3 font-medium text-zinc-900">
                      <Link
                        href={`/teacher/quizzes/${session.quizId}#session-${session.sessionId}`}
                        className={linkClassName}>
                        {session.quizTitle}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-zinc-600">
                      {formatSessionDateTime(session.launchedAt)}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          sessionStatusBadgeClass(session.status),
                        )}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-zinc-700">
                      {session.joinedCount}
                      <span className="text-zinc-400">
                        {" "}
                        / {session.submittedCount} submitted
                      </span>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-zinc-900">
                      {session.averageScore !== null
                        ? `${session.averageScore}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DashboardAttemptHighlights
        submittedAttempts={stats.submittedAttempts}
        sessionResults={stats.sessionResults}
      />
    </div>
  );
}
