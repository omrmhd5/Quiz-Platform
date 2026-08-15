"use client";

import { useEffect, useState } from "react";
import {
  QuizQuestionsSection,
  type QuizQuestionView,
} from "@/components/quizzes/quiz-questions-section";
import { QuizResultsSection } from "@/components/quizzes/quiz-results-section";
import { LaunchQuizPanel } from "@/components/sessions/launch-quiz-panel";
import type { SessionSummaryView } from "@/lib/session-results";
import type { ActiveSessionInfo } from "@/lib/sessions";

type QuizDetailBodyProps = {
  quizId: string;
  quizTitle: string;
  joinUrl: string;
  activeSession: ActiveSessionInfo | null;
  joinedCount: number;
  questions: QuizQuestionView[];
  sessions: SessionSummaryView[];
};

function getSessionFromHash() {
  if (typeof window === "undefined") {
    return null;
  }

  const match = window.location.hash.match(/^#session-(.+)$/);
  return match?.[1] ?? null;
}

export function QuizDetailBody({
  quizId,
  quizTitle,
  joinUrl,
  activeSession,
  joinedCount,
  questions,
  sessions,
}: QuizDetailBodyProps) {
  const [modalSessionId, setModalSessionId] = useState<string | null>(null);

  const liveSessionId =
    activeSession?.quizId === quizId ? activeSession.sessionId : null;

  useEffect(() => {
    function syncFromHash() {
      const hashSessionId = getSessionFromHash();
      if (
        hashSessionId &&
        sessions.some((session) => session.sessionId === hashSessionId)
      ) {
        setModalSessionId(hashSessionId);
      }
    }

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [sessions]);

  function openSessionResults(sessionId: string) {
    setModalSessionId(sessionId);
    window.history.replaceState(null, "", `#session-${sessionId}`);
  }

  function closeSessionResults() {
    setModalSessionId(null);
    if (getSessionFromHash()) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  return (
    <>
      <LaunchQuizPanel
        quizId={quizId}
        quizTitle={quizTitle}
        joinUrl={joinUrl}
        activeSession={activeSession}
        joinedCount={joinedCount}
        onViewLiveResults={
          liveSessionId ? () => openSessionResults(liveSessionId) : undefined
        }
      />

      <QuizQuestionsSection questions={questions} />

      <QuizResultsSection
        sessions={sessions}
        modalSessionId={modalSessionId}
        onModalSessionIdChange={(sessionId) =>
          sessionId ? openSessionResults(sessionId) : closeSessionResults()
        }
      />
    </>
  );
}
