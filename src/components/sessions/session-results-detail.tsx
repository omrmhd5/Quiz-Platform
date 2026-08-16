"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PaginationControls } from "@/components/pagination-controls";
import { SessionQuizStats } from "@/components/sessions/session-quiz-stats";
import { StatCard } from "@/components/stat-display";
import {
  AttemptStatusBadge,
  resolveAttemptStatus,
} from "@/components/ui/attempt-status-badge";
import type { SessionResultsView } from "@/lib/session-results";
import {
  formatSessionDateTime,
  sessionStatusBadgeClass,
} from "@/lib/session-format";
import { SESSION_RESULTS_PAGE_SIZE, paginateSlice } from "@/lib/pagination";
import {
  cn,
  inputClassName,
  labelClassName,
  linkClassName,
  navLinkClassName,
  segmentClassName,
  tableShellClassName,
  tableBodyClassName,
  tableCellClassName,
  tableClassName,
  tableHeadCellClassName,
  tableHeadClassName,
  tableHeadRowClassName,
} from "@/lib/utils";

type SessionResultsDetailProps = {
  results: SessionResultsView;
  showHeader?: boolean;
};

type SessionResultsTab = "stats" | "students";

function parseStudentIdFilter(query: string) {
  return query
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function getAttemptStatusDisplay(
  sessionStatus: SessionResultsView["status"],
  attemptStatus: SessionResultsView["attempts"][number]["status"],
) {
  const status = resolveAttemptStatus(sessionStatus, attemptStatus);

  return {
    kind: status.kind,
    label: status.label,
    className: status.className,
  };
}

export function SessionResultsDetail({
  results,
  showHeader = false,
}: SessionResultsDetailProps) {
  const isLive = results.status === "active";
  const [activeTab, setActiveTab] = useState<SessionResultsTab>("stats");
  const [idFilter, setIdFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setActiveTab("stats");
    setIdFilter("");
    setPage(1);
  }, [results.sessionId]);

  useEffect(() => {
    setPage(1);
  }, [idFilter]);

  const filterIds = useMemo(() => parseStudentIdFilter(idFilter), [idFilter]);

  const displayedAttempts = useMemo(() => {
    if (filterIds.length === 0) {
      return results.attempts;
    }

    const idSet = new Set(filterIds);
    return results.attempts.filter((attempt) => idSet.has(attempt.studentId));
  }, [filterIds, results.attempts]);

  const missingIds = useMemo(() => {
    if (filterIds.length === 0) {
      return [];
    }

    const joinedIds = new Set(
      results.attempts.map((attempt) => attempt.studentId),
    );
    return filterIds.filter((id) => !joinedIds.has(id));
  }, [filterIds, results.attempts]);

  const pagination = useMemo(
    () => paginateSlice(displayedAttempts, page, SESSION_RESULTS_PAGE_SIZE),
    [displayedAttempts, page],
  );

  const liveInProgress =
    results.status === "active" ? results.inProgressCount : 0;
  const didntFinishCount =
    results.status === "closed" ? results.inProgressCount : 0;

  return (
    <div className="space-y-5">
      {showHeader ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                sessionStatusBadgeClass(results.status),
              )}>
              {results.status}
            </span>
            {isLive ? (
              <span className="flex items-center gap-2 text-sm text-green-800">
                <span className="ui-live-dot" aria-hidden="true" />
                <span aria-live="polite">Updating live</span>
              </span>
            ) : null}
          </div>
          <p className="text-sm text-zinc-600">
            Launched {formatSessionDateTime(results.launchedAt)}
            {results.closedAt
              ? ` · Closed ${formatSessionDateTime(results.closedAt)}`
              : null}
          </p>
        </div>
      ) : null}

      <nav
        aria-label="Session results sections"
        className={cn(segmentClassName, "grid-cols-2")}>
        <button
          type="button"
          aria-current={activeTab === "stats" ? "page" : undefined}
          onClick={() => setActiveTab("stats")}
          className={cn(
            navLinkClassName,
            "w-full justify-center",
            activeTab === "stats" && "is-active",
          )}>
          Stats
        </button>
        <button
          type="button"
          aria-current={activeTab === "students" ? "page" : undefined}
          onClick={() => setActiveTab("students")}
          className={cn(
            navLinkClassName,
            "w-full justify-center",
            activeTab === "students" && "is-active",
          )}>
          Students
          <span className="ml-1.5 tabular-nums text-zinc-500">
            ({results.joinedCount})
          </span>
        </button>
      </nav>

      {activeTab === "stats" ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Joined / registered"
              preset="joined"
              value={
                <>
                  {results.joinedCount}
                  <span className="text-lg font-normal text-zinc-500">
                    {" "}
                    / {results.registeredCount}
                  </span>
                </>
              }
            />
            <StatCard
              label="Submitted"
              value={results.submittedCount}
              preset="submitted"
            />
            <StatCard
              label="In progress"
              value={liveInProgress}
              preset="inProgress"
            />
            <StatCard
              label="Didn't finish"
              value={didntFinishCount}
              preset="didntFinish"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Highest score"
              value={
                results.highestScore !== null
                  ? `${results.highestScore}%`
                  : "—"
              }
              preset="highestScore"
            />
            <StatCard
              label="Average score"
              value={
                results.averageScore !== null
                  ? `${results.averageScore}%`
                  : "—"
              }
              preset="averageScore"
            />
            <StatCard
              label="Lowest score"
              value={
                results.lowestScore !== null ? `${results.lowestScore}%` : "—"
              }
              preset="lowestScore"
            />
          </div>

          <SessionQuizStats
            questionStats={results.questionStats}
            submittedCount={results.submittedCount}
            totalCorrect={results.totalCorrect}
            totalWrong={results.totalWrong}
            totalSkipped={results.totalSkipped}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor={`student-id-filter-${results.sessionId}`}
              className={labelClassName}>
              Search by student ID
            </label>
            <input
              id={`student-id-filter-${results.sessionId}`}
              type="text"
              value={idFilter}
              onChange={(event) => setIdFilter(event.target.value)}
              placeholder="101, 105, 110"
              className={inputClassName}
            />
            <p className="text-xs text-zinc-500">
              Separate multiple IDs with commas.
              {filterIds.length > 0
                ? ` Showing ${displayedAttempts.length} of ${results.attempts.length}.`
                : null}
            </p>
            {missingIds.length > 0 ? (
              <p className="text-xs text-amber-800">
                Not in this session: {missingIds.join(", ")}
              </p>
            ) : null}
          </div>

          <PaginationControls
            page={pagination.page}
            pageCount={pagination.pageCount}
            totalItems={displayedAttempts.length}
            pageSize={SESSION_RESULTS_PAGE_SIZE}
            onPageChange={setPage}
          />

          <div className={tableShellClassName}>
            <table className={tableClassName}>
              <thead className={tableHeadClassName}>
                <tr className={tableHeadRowClassName}>
                  <th scope="col" className={tableHeadCellClassName}>Student</th>
                  <th scope="col" className={cn(tableHeadCellClassName, "hidden sm:table-cell")}>ID</th>
                  <th scope="col" className={tableHeadCellClassName}>Status</th>
                  <th scope="col" className={tableHeadCellClassName}>Score</th>
                  <th scope="col" className={cn(tableHeadCellClassName, "hidden md:table-cell")}>Correct</th>
                  <th scope="col" className={cn(tableHeadCellClassName, "hidden md:table-cell")}>Wrong</th>
                  <th scope="col" className={cn(tableHeadCellClassName, "hidden lg:table-cell")}>Skipped</th>
                </tr>
              </thead>
              <tbody className={tableBodyClassName}>
                {results.attempts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-8 text-center text-zinc-600">
                      No students have joined this session yet.
                    </td>
                  </tr>
                ) : displayedAttempts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-8 text-center text-zinc-600">
                      No students match these IDs.
                    </td>
                  </tr>
                ) : (
                  pagination.items.map((attempt) => {
                    const attemptStatus = getAttemptStatusDisplay(
                      results.status,
                      attempt.status,
                    );

                    return (
                      <tr key={attempt.attemptId} className="ui-table-row">
                        <td className={cn(tableCellClassName, "font-medium text-zinc-900")}>
                          <Link
                            href={`/teacher/students/${attempt.studentId}/history`}
                            className={linkClassName}>
                            {attempt.studentName}
                          </Link>
                          <p className="font-mono text-xs text-zinc-500 sm:hidden">
                            {attempt.studentId}
                          </p>
                        </td>
                        <td className={cn(tableCellClassName, "hidden font-mono text-zinc-700 sm:table-cell")}>
                          <Link
                            href={`/teacher/students/${attempt.studentId}/history`}
                            className={linkClassName}>
                            {attempt.studentId}
                          </Link>
                        </td>
                        <td className={tableCellClassName}>
                          <AttemptStatusBadge
                            kind={attemptStatus.kind}
                            label={attemptStatus.label}
                            className={attemptStatus.className}
                          />
                        </td>
                        <td className={cn(tableCellClassName, "tabular-nums text-zinc-900")}>
                          {attempt.scorePercent !== null
                            ? `${attempt.scorePercent}%`
                            : "—"}
                        </td>
                        <td className={cn(tableCellClassName, "hidden tabular-nums text-zinc-700 md:table-cell")}>
                          {attempt.correctCount ?? "—"}
                        </td>
                        <td className={cn(tableCellClassName, "hidden tabular-nums text-zinc-700 md:table-cell")}>
                          {attempt.wrongCount ?? "—"}
                        </td>
                        <td className={cn(tableCellClassName, "hidden tabular-nums text-zinc-700 lg:table-cell")}>
                          {attempt.unansweredCount ?? "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls
            page={pagination.page}
            pageCount={pagination.pageCount}
            totalItems={displayedAttempts.length}
            pageSize={SESSION_RESULTS_PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
