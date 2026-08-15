"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DASHBOARD_ATTEMPT_HIGHLIGHTS,
  type DashboardAttemptRow,
  type DashboardSessionResultRow,
} from "@/lib/dashboard";
import {
  formatSessionDateTime,
  sessionStatusBadgeClass,
} from "@/lib/session-format";
import {
  cn,
  emptyStateClassName,
  linkClassName,
  navLinkClassName,
  panelClassName,
  segmentClassName,
  tableShellClassName,
} from "@/lib/utils";

type DashboardAttemptHighlightsProps = {
  topAttemptsHighest: DashboardAttemptRow[];
  topAttemptsLowest: DashboardAttemptRow[];
  topResultsHighest: DashboardSessionResultRow[];
  topResultsLowest: DashboardSessionResultRow[];
};

type ViewTab = "attempts" | "results";
type RankDirection = "highest" | "lowest";

const CHART_COLORS = {
  highest: "#22c55e",
  lowest: "#ef4444",
};

function formatAttemptChartLabel(attempt: DashboardAttemptRow) {
  const name =
    attempt.studentName.length > 12
      ? `${attempt.studentName.slice(0, 12)}…`
      : attempt.studentName;

  return `${name} (${attempt.studentId})`;
}

function formatResultChartLabel(result: DashboardSessionResultRow) {
  const title =
    result.quizTitle.length > 16
      ? `${result.quizTitle.slice(0, 16)}…`
      : result.quizTitle;

  const dateLabel = result.launchedAt
    ? result.launchedAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Session";

  return `${title} · ${dateLabel}`;
}

export function DashboardAttemptHighlights({
  topAttemptsHighest,
  topAttemptsLowest,
  topResultsHighest,
  topResultsLowest,
}: DashboardAttemptHighlightsProps) {
  const [viewTab, setViewTab] = useState<ViewTab>("attempts");
  const [direction, setDirection] = useState<RankDirection>("highest");

  const rankedAttempts =
    direction === "highest" ? topAttemptsHighest : topAttemptsLowest;
  const rankedResults =
    direction === "highest" ? topResultsHighest : topResultsLowest;

  const attemptChartData = useMemo(
    () =>
      rankedAttempts.map((attempt, index) => ({
        label: `#${index + 1}`,
        score: attempt.scorePercent,
        name: formatAttemptChartLabel(attempt),
      })),
    [rankedAttempts],
  );

  const resultChartData = useMemo(
    () =>
      rankedResults.map((result, index) => ({
        label: `#${index + 1}`,
        score: result.averageScore as number,
        name: formatResultChartLabel(result),
      })),
    [rankedResults],
  );

  const barColor =
    direction === "highest" ? CHART_COLORS.highest : CHART_COLORS.lowest;

  const chartData = viewTab === "attempts" ? attemptChartData : resultChartData;
  const isEmpty =
    viewTab === "attempts"
      ? rankedAttempts.length === 0
      : rankedResults.length === 0;

  return (
    <div className={`${panelClassName} space-y-4`}>
      <div>
        <h2 className="text-base font-semibold text-zinc-900">
          Top attempts &amp; results
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Top {DASHBOARD_ATTEMPT_HIGHLIGHTS}{" "}
          {viewTab === "attempts"
            ? "student attempts by score %."
            : "quiz session results by average score %."}
        </p>
      </div>

      <nav
        aria-label="Ranking view"
        className={cn(segmentClassName, "grid-cols-2")}>
        <button
          type="button"
          aria-current={viewTab === "attempts" ? "page" : undefined}
          onClick={() => setViewTab("attempts")}
          className={cn(
            navLinkClassName,
            "flex w-full justify-center text-center",
            viewTab === "attempts" && "is-active",
          )}>
          Top attempts
        </button>
        <button
          type="button"
          aria-current={viewTab === "results" ? "page" : undefined}
          onClick={() => setViewTab("results")}
          className={cn(
            navLinkClassName,
            "flex w-full justify-center text-center",
            viewTab === "results" && "is-active",
          )}>
          Top results
        </button>
      </nav>

      <nav
        aria-label="Rank direction"
        className={cn(segmentClassName, "grid-cols-2")}>
        <button
          type="button"
          aria-current={direction === "highest" ? "page" : undefined}
          onClick={() => setDirection("highest")}
          className={cn(
            navLinkClassName,
            "flex w-full justify-center text-center",
            direction === "highest" && "is-active",
          )}>
          Highest scores
        </button>
        <button
          type="button"
          aria-current={direction === "lowest" ? "page" : undefined}
          onClick={() => setDirection("lowest")}
          className={cn(
            navLinkClassName,
            "flex w-full justify-center text-center",
            direction === "lowest" && "is-active",
          )}>
          Lowest scores
        </button>
      </nav>

      {isEmpty ? (
        <p className={emptyStateClassName}>
          {viewTab === "attempts"
            ? "Attempt rankings appear after students submit quizzes."
            : "Session result rankings appear after students submit quizzes."}
        </p>
      ) : (
        <>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#f4f4f5" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={36}
                  tick={{ fontSize: 11, fill: "#71717a" }}
                />
                <Tooltip
                  formatter={(value, _name, item) => [
                    `${value}%`,
                    item.payload.name,
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    borderColor: "#e4e4e7",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={28}>
                  {chartData.map((entry) => (
                    <Cell key={entry.label} fill={barColor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {viewTab === "attempts" ? (
            <div className={tableShellClassName}>
              <table className="min-w-full divide-y divide-zinc-200 text-sm">
                <thead className="bg-zinc-50">
                  <tr className="text-left text-zinc-500">
                    <th className="px-3 py-2 font-medium">Student</th>
                    <th className="px-3 py-2 font-medium">Quiz</th>
                    <th className="px-3 py-2 font-medium">Submitted</th>
                    <th className="px-3 py-2 font-medium">Score</th>
                    <th className="px-3 py-2 font-medium">Correct</th>
                    <th className="px-3 py-2 font-medium">Wrong</th>
                    <th className="px-3 py-2 font-medium">Skipped</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {rankedAttempts.map((attempt) => (
                    <tr key={attempt.attemptId} className="ui-table-row">
                      <td className="px-3 py-3">
                        <Link
                          href={`/teacher/students/${attempt.studentId}/history`}
                          className={linkClassName}>
                          {attempt.studentName}
                        </Link>
                        <p className="text-xs text-zinc-500">
                          {attempt.studentId}
                        </p>
                      </td>
                      <td className="px-3 py-3 font-medium text-zinc-900">
                        <Link
                          href={`/teacher/quizzes/${attempt.quizId}#session-${attempt.sessionId}`}
                          className={linkClassName}>
                          {attempt.quizTitle}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-zinc-600">
                        {formatSessionDateTime(attempt.submittedAt)}
                      </td>
                      <td className="px-3 py-3 tabular-nums font-medium text-zinc-900">
                        {attempt.scorePercent}%
                      </td>
                      <td className="px-3 py-3 tabular-nums text-zinc-700">
                        {attempt.correctCount}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-zinc-700">
                        {attempt.wrongCount}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-zinc-700">
                        {attempt.unansweredCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={tableShellClassName}>
              <table className="min-w-full divide-y divide-zinc-200 text-sm">
                <thead className="bg-zinc-50">
                  <tr className="text-left text-zinc-500">
                    <th className="px-3 py-2 font-medium">Quiz</th>
                    <th className="px-3 py-2 font-medium">When</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Joined</th>
                    <th className="px-3 py-2 font-medium">Average</th>
                    <th className="px-3 py-2 font-medium">Highest</th>
                    <th className="px-3 py-2 font-medium">Lowest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {rankedResults.map((result) => (
                    <tr key={result.sessionId} className="ui-table-row">
                      <td className="px-3 py-3 font-medium text-zinc-900">
                        <Link
                          href={`/teacher/quizzes/${result.quizId}#session-${result.sessionId}`}
                          className={linkClassName}>
                          {result.quizTitle}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-zinc-600">
                        {formatSessionDateTime(result.launchedAt)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                            sessionStatusBadgeClass(result.status),
                          )}>
                          {result.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 tabular-nums text-zinc-700">
                        {result.joinedCount}
                        <span className="text-zinc-400">
                          {" "}
                          / {result.submittedCount} submitted
                        </span>
                      </td>
                      <td className="px-3 py-3 tabular-nums font-medium text-zinc-900">
                        {result.averageScore !== null
                          ? `${result.averageScore}%`
                          : "—"}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-zinc-700">
                        {result.highestScore !== null
                          ? `${result.highestScore}%`
                          : "—"}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-zinc-700">
                        {result.lowestScore !== null
                          ? `${result.lowestScore}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
