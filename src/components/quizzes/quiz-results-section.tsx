"use client";

import { useEffect, useMemo, useState } from "react";
import { ContentModal } from "@/components/content-modal";
import { PaginationControls } from "@/components/pagination-controls";
import { ActionButton } from "@/components/ui/action-control";
import {
  formatSessionDateTime,
  sessionStatusBadgeClass,
} from "@/lib/session-format";
import { SessionResultsDetail } from "@/components/sessions/session-results-detail";
import type {
  SessionResultsView,
  SessionSummaryView,
} from "@/lib/session-results";
import { SESSIONS_PAGE_SIZE, paginateSlice } from "@/lib/pagination";
import {
  cn,
  panelClassName,
} from "@/lib/utils";
import {
  getSessionResults,
  getSessionResultsSnapshot,
} from "@/server/actions/session-results";

type QuizResultsSectionProps = {
  sessions: SessionSummaryView[];
  modalSessionId: string | null;
  onModalSessionIdChange: (sessionId: string | null) => void;
};

function toSummary(results: SessionResultsView): SessionSummaryView {
  return {
    sessionId: results.sessionId,
    quizId: results.quizId,
    quizTitle: results.quizTitle,
    status: results.status,
    launchedAt: results.launchedAt,
    closedAt: results.closedAt,
    joinedCount: results.joinedCount,
    submittedCount: results.submittedCount,
    inProgressCount: results.inProgressCount,
    averageScore: results.averageScore,
    highestScore: results.highestScore,
    lowestScore: results.lowestScore,
  };
}

export function QuizResultsSection({
  sessions: initialSessions,
  modalSessionId,
  onModalSessionIdChange,
}: QuizResultsSectionProps) {
  const [sessions, setSessions] = useState(initialSessions);
  const [page, setPage] = useState(1);
  const [modalResults, setModalResults] = useState<SessionResultsView | null>(
    null,
  );
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    setSessions(initialSessions);
  }, [initialSessions]);

  useEffect(() => {
    if (!modalSessionId) {
      setModalResults(null);
      setModalLoading(false);
      return;
    }

    let cancelled = false;
    setModalLoading(true);

    void getSessionResults(modalSessionId)
      .then((results) => {
        if (!cancelled) {
          setModalResults(results);
          setModalLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setModalLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [modalSessionId]);

  useEffect(() => {
    if (!modalSessionId) {
      return;
    }

    const sessionIndex = sessions.findIndex(
      (session) => session.sessionId === modalSessionId,
    );

    if (sessionIndex === -1) {
      return;
    }

    setPage(Math.floor(sessionIndex / SESSIONS_PAGE_SIZE) + 1);
  }, [modalSessionId, sessions]);

  const pagination = useMemo(
    () => paginateSlice(sessions, page, SESSIONS_PAGE_SIZE),
    [page, sessions],
  );

  const activeSessionKey = useMemo(
    () =>
      sessions
        .filter((session) => session.status === "active")
        .map((session) => session.sessionId)
        .join(","),
    [sessions],
  );

  useEffect(() => {
    if (!activeSessionKey) {
      return;
    }

    const activeIds = activeSessionKey.split(",").filter(Boolean);
    let cancelled = false;

    async function poll() {
      try {
        const updates = await Promise.all(
          activeIds.map((sessionId) => getSessionResultsSnapshot(sessionId)),
        );

        if (cancelled) {
          return;
        }

        setSessions((current) =>
          current.map((session) => {
            const updated = updates.find(
              (row) => row.sessionId === session.sessionId,
            );
            return updated ? toSummary(updated) : session;
          }),
        );

        if (modalSessionId) {
          const modalUpdate = updates.find(
            (row) => row.sessionId === modalSessionId,
          );
          if (modalUpdate) {
            setModalResults(modalUpdate);
          }
        }
      } catch {
        // Retry on next interval.
      }
    }

    void poll();

    const intervalId = window.setInterval(() => {
      void poll();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [activeSessionKey, modalSessionId]);

  if (sessions.length === 0) {
    return null;
  }

  const modalSummary = modalSessionId
    ? sessions.find((session) => session.sessionId === modalSessionId)
    : undefined;

  return (
    <>
      <div id="results" className="scroll-mt-24 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Results</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Open a session to view student scores.
          </p>
        </div>

        <div className={`${panelClassName} space-y-4 overflow-x-auto`}>
          <PaginationControls
            page={pagination.page}
            pageCount={pagination.pageCount}
            totalItems={sessions.length}
            pageSize={SESSIONS_PAGE_SIZE}
            onPageChange={setPage}
          />

          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="px-3 py-2 font-medium">Session</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Joined</th>
                <th className="px-3 py-2 font-medium">Submitted</th>
                <th className="px-3 py-2 font-medium">Avg score</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {pagination.items.map((session) => (
                <tr
                  key={session.sessionId}
                  id={`session-${session.sessionId}`}
                  className="ui-table-row scroll-mt-24">
                  <td className="px-3 py-3 font-medium text-zinc-900">
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
                  </td>
                  <td className="px-3 py-3 tabular-nums text-zinc-700">
                    {session.submittedCount}
                  </td>
                  <td className="px-3 py-3 tabular-nums text-zinc-700">
                    {session.averageScore !== null
                      ? `${session.averageScore}%`
                      : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <ActionButton
                      action={session.status === "active" ? "live" : "open"}
                      onClick={() => onModalSessionIdChange(session.sessionId)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <PaginationControls
            page={pagination.page}
            pageCount={pagination.pageCount}
            totalItems={sessions.length}
            pageSize={SESSIONS_PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>

      <ContentModal
        open={modalSessionId !== null}
        title={
          modalSummary
            ? `Results · ${formatSessionDateTime(modalSummary.launchedAt)}`
            : "Session results"
        }
        description={
          modalSummary
            ? `${modalSummary.joinedCount} joined · ${modalSummary.submittedCount} submitted`
            : undefined
        }
        size="lg"
        onClose={() => onModalSessionIdChange(null)}>
        {modalLoading ? (
          <p className="py-8 text-center text-sm text-zinc-600">
            Loading session results…
          </p>
        ) : modalResults ? (
          <SessionResultsDetail results={modalResults} showHeader />
        ) : null}
      </ContentModal>
    </>
  );
}
