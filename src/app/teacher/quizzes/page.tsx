import { ActiveSessionBanner } from "@/components/sessions/active-session-banner";
import { QuizzesTable } from "@/components/quizzes/quizzes-table";
import { ActionLink } from "@/components/ui/action-control";
import { getJoinUrl } from "@/lib/join-url";
import { getMessage } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";
import {
  emptyStateClassName,
  pageDescriptionClassName,
  pageTitleClassName,
  panelClassName,
} from "@/lib/utils";
import { getQuizzes } from "@/server/actions/quizzes";
import { getActiveSession } from "@/server/actions/sessions";

export default async function QuizzesPage() {
  const [quizRows, activeSession, joinUrl, locale] = await Promise.all([
    getQuizzes(),
    getActiveSession(),
    getJoinUrl(),
    getRequestLocale(),
  ]);

  return (
    <div id="quizzes-page" className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={pageTitleClassName}>
            {getMessage(locale, "quizzes.title")}
          </h1>
          <p className={pageDescriptionClassName}>
            {getMessage(locale, "quizzes.subtitle")}
          </p>
        </div>
        <ActionLink action="createQuiz" href="/teacher/quizzes/new" size="md" />
      </div>

      {activeSession ? (
        <ActiveSessionBanner
          activeSession={activeSession}
          joinUrl={joinUrl}
          joinedCount={activeSession.joinedCount}
        />
      ) : null}

      {quizRows.length === 0 ? (
        <div className={`${panelClassName} space-y-4`}>
          <p className={emptyStateClassName}>
            {getMessage(locale, "quizzes.empty")}
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
