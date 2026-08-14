"use client";

import { useEffect, useMemo, useState } from "react";
import { PaginationControls } from "@/components/pagination-controls";
import type { SessionResultsView } from "@/lib/session-results";
import {
  SESSION_RESULTS_PAGE_SIZE,
  paginateSlice,
} from "@/lib/pagination";
import { cn, inputClassName, statCardClassName } from "@/lib/utils";

type SessionResultsDetailProps = {
  results: SessionResultsView;
  showHeader?: boolean;
};

function parseStudentIdFilter(query: string) {
  return query
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function formatSessionDateTime(value: Date | string | null) {
  if (!value) {
    return "—";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function sessionStatusBadgeClass(status: SessionResultsView["status"]) {
  if (status === "active") {
    return "bg-green-100 text-green-800";
  }

  if (status === "closed") {
    return "bg-zinc-100 text-zinc-700";
  }

  return "bg-amber-100 text-amber-800";
}

function getAttemptStatusDisplay(
  sessionStatus: SessionResultsView["status"],
  attemptStatus: SessionResultsView["attempts"][number]["status"],
) {
  if (attemptStatus === "submitted") {
    return {
      label: "Submitted",
      className: "bg-green-100 text-green-800",
    };
  }

  if (sessionStatus === "closed") {
    return {
      label: "Didn't finish",
      className: "bg-red-100 text-red-800",
    };
  }

  return {
    label: "In progress",
    className: "bg-amber-100 text-amber-800",
  };
}

export function SessionResultsDetail({
  results,
  showHeader = false,
}: SessionResultsDetailProps) {
  const isLive = results.status === "active";
  const [idFilter, setIdFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
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
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Updating live
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={statCardClassName}>
          <p className="text-sm text-zinc-600">Joined</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
            {results.joinedCount}
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
            {results.inProgressCount}
          </p>
        </div>
        <div className={statCardClassName}>
          <p className="text-sm text-zinc-600">Average score</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
            {results.averageScore !== null ? `${results.averageScore}%` : "—"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor={`student-id-filter-${results.sessionId}`}
          className="text-sm font-medium text-zinc-700">
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

      <div className="overflow-x-auto rounded-lg border border-zinc-200">
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
                <td colSpan={7} className="px-3 py-8 text-center text-zinc-600">
                  No students have joined this session yet.
                </td>
              </tr>
            ) : displayedAttempts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-zinc-600">
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
                    {attempt.studentName}
                  </td>
                  <td className="px-3 py-3 font-mono text-zinc-700">
                    {attempt.studentId}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        attemptStatus.className,
                      )}>
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
  );
}
