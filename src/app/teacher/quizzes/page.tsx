import { ActiveSessionBanner } from "@/components/sessions/active-session-banner";
import { QuizzesTable } from "@/components/quizzes/quizzes-table";
import { ActionLink } from "@/components/ui/action-control";
import { getJoinUrl } from "@/lib/join-url";
import {
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
        <ActionLink action="createQuiz" href="/teacher/quizzes/new" size="md" />
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
          <ActionLink
            action="createQuiz"
            href="/teacher/quizzes/new"
            size="md"
            className="w-full justify-center sm:w-auto"
          />
        </div>
      ) : (
        <QuizzesTable quizzes={quizRows} activeSession={activeSession} />
      )}
    </div>
  );
}
