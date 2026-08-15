"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PaginationControls } from "@/components/pagination-controls";
import { SessionQuizStats } from "@/components/sessions/session-quiz-stats";
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
  statCardClassName,
  tableShellClassName,
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
  if (attemptStatus === "submitted") {
    return {
      label: "Submitted",
      className: "ui-badge ui-badge-success",
    };
  }

  if (sessionStatus === "closed") {
    return {
      label: "Didn't finish",
      className: "ui-badge ui-badge-danger",
    };
  }

  return {
    label: "In progress",
    className: "ui-badge ui-badge-progress",
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
            <div className={statCardClassName}>
              <p className="text-sm text-zinc-600">Joined / registered</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
                {results.joinedCount}
                <span className="text-lg font-normal text-zinc-500">
                  {" "}
                  / {results.registeredCount}
                </span>
              </p>
            </div>
            <div className={statCardClassName}>
              <p className="text-sm text-zinc-600">Submitted</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
                {results.submittedCount}
              </p>
            </div>
            <div className={statCardClassName}>
              <p className="text-sm text-zinc-600">In progress</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
                {liveInProgress}
              </p>
            </div>
            <div className={statCardClassName}>
              <p className="text-sm text-zinc-600">Didn&apos;t finish</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
                {didntFinishCount}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className={statCardClassName}>
              <p className="text-sm text-zinc-600">Highest score</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
                {results.highestScore !== null
                  ? `${results.highestScore}%`
                  : "—"}
              </p>
            </div>
            <div className={statCardClassName}>
              <p className="text-sm text-zinc-600">Average score</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
                {results.averageScore !== null
                  ? `${results.averageScore}%`
                  : "—"}
              </p>
            </div>
            <div className={statCardClassName}>
              <p className="text-sm text-zinc-600">Lowest score</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
                {results.lowestScore !== null ? `${results.lowestScore}%` : "—"}
              </p>
            </div>
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
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50">
                <tr className="text-left text-zinc-500">
                  <th className="px-3 py-2 font-medium">Student</th>
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Score</th>
                  <th className="px-3 py-2 font-medium">Correct</th>
                  <th className="px-3 py-2 font-medium">Wrong</th>
                  <th className="px-3 py-2 font-medium">Skipped</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
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
                        <td className="px-3 py-3 font-medium text-zinc-900">
                          <Link
                            href={`/teacher/students/${attempt.studentId}/history`}
                            className={linkClassName}>
                            {attempt.studentName}
                          </Link>
                        </td>
                        <td className="px-3 py-3 font-mono text-zinc-700">
                          <Link
                            href={`/teacher/students/${attempt.studentId}/history`}
                            className={linkClassName}>
                            {attempt.studentId}
                          </Link>
                        </td>
                        <td className="px-3 py-3">
                          <span className={cn(attemptStatus.className)}>
                            {attemptStatus.label}
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
