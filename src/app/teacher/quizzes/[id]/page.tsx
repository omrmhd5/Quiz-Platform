import { notFound } from "next/navigation";
import { DeleteQuizButton } from "@/components/quizzes/delete-quiz-button";
import { QuizDetailBody } from "@/components/quizzes/quiz-detail-body";
import { ActionLink } from "@/components/ui/action-control";
import { getJoinUrl } from "@/lib/join-url";
import { getRequestLocale } from "@/lib/i18n/server";
import { getMessage } from "@/lib/i18n/messages";
import {
  pageDescriptionClassName,
  pageTitleClassName,
} from "@/lib/utils";
import { getQuizById } from "@/server/actions/quizzes";
import { getQuizSessionSummaries } from "@/server/actions/session-results";
import {
  getActiveSession,
  getActiveSessionAttemptCount,
} from "@/server/actions/sessions";

type QuizDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuizDetailPage({ params }: QuizDetailPageProps) {
  const { id } = await params;
  const locale = await getRequestLocale();
  const [quiz, activeSession, joinUrl, sessionSummaries] = await Promise.all([
    getQuizById(id),
    getActiveSession(),
    getJoinUrl(),
    getQuizSessionSummaries(id),
  ]);

  if (!quiz) {
    notFound();
  }

  const hasSessions = quiz.sessions.length > 0;
  const isThisQuizLive = activeSession?.quizId === quiz.id;
  const joinedCount =
    isThisQuizLive && activeSession
      ? await getActiveSessionAttemptCount(activeSession.sessionId)
      : 0;

  const questionViews = quiz.questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    options: question.options.map((option) => ({
      id: option.id,
      text: option.text,
      orderIndex: option.orderIndex,
      isCorrect: option.isCorrect,
    })),
  }));

  return (
    <div id="quiz-detail-page" className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={pageTitleClassName}>{quiz.title}</h1>
          <p className={pageDescriptionClassName}>
            {getMessage(locale, "quizzes.questionsCount", { count: quiz.questionCount })} ·{" "}
            {isThisQuizLive
              ? getMessage(locale, "quizzes.liveNow")
              : hasSessions
                ? getMessage(locale, "quizzes.sessionsRecorded", { count: quiz.sessions.length })
                : getMessage(locale, "quizzes.notLaunched")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionLink
            action="back"
            label={getMessage(locale, "quizzes.backToList")}
            href="/teacher/quizzes"
            size="md"
          />
          <ActionLink
            action="edit"
            href={`/teacher/quizzes/${quiz.id}/edit`}
            size="md"
          />
          <DeleteQuizButton
            quizId={quiz.id}
            quizTitle={quiz.title}
            sessionCount={quiz.sessions.length}
            isLive={isThisQuizLive}
          />
        </div>
      </div>

      {hasSessions ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {getMessage(locale, "quizzes.sessionHistoryWarning")}
        </p>
      ) : null}

      <QuizDetailBody
        quizId={quiz.id}
        quizTitle={quiz.title}
        joinUrl={joinUrl}
        activeSession={activeSession}
        joinedCount={joinedCount}
        questions={questionViews}
        sessions={sessionSummaries}
      />
    </div>
  );
}
