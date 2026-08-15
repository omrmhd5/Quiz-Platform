import Link from "next/link";
import { ActiveSessionBanner } from "@/components/sessions/active-session-banner";
import { QuizzesTable } from "@/components/quizzes/quizzes-table";
import { getJoinUrl } from "@/lib/join-url";
import {
  buttonPrimaryClassName,
  cn,
  emptyStateClassName,
  pageDescriptionClassName,
  pageTitleClassName,
  panelClassName,
} from "@/lib/utils";
import { getQuizzes } from "@/server/actions/quizzes";
import {
  getActiveSession,
  getActiveSessionAttemptCount,
} from "@/server/actions/sessions";

export default async function QuizzesPage() {
  const [quizRows, activeSession, joinUrl] = await Promise.all([
    getQuizzes(),
    getActiveSession(),
    getJoinUrl(),
  ]);

  const joinedCount =
    activeSession !== null
      ? await getActiveSessionAttemptCount(activeSession.sessionId)
      : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={pageTitleClassName}>Quizzes</h1>
          <p className={pageDescriptionClassName}>
            Create, save, and manage multiple-choice quizzes.
          </p>
        </div>
        <Link
          href="/teacher/quizzes/new"
          className={cn(buttonPrimaryClassName, "inline-flex items-center")}>
          Create quiz
        </Link>
      </div>

      {activeSession ? (
        <ActiveSessionBanner
          activeSession={activeSession}
          joinUrl={joinUrl}
          joinedCount={joinedCount}
        />
      ) : null}

      {quizRows.length === 0 ? (
        <div className={`${panelClassName} space-y-4`}>
          <p className={emptyStateClassName}>
            No quizzes yet. Create your first MCQ quiz to get started.
          </p>
          <Link
            href="/teacher/quizzes/new"
            className={cn(
              buttonPrimaryClassName,
              "inline-flex w-full justify-center sm:w-auto",
            )}>
            Create quiz
          </Link>
        </div>
      ) : (
        <QuizzesTable quizzes={quizRows} activeSession={activeSession} />
      )}
    </div>
  );
}
