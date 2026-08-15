import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteQuizButton } from "@/components/quizzes/delete-quiz-button";
import { QuizDetailBody } from "@/components/quizzes/quiz-detail-body";
import { getJoinUrl } from "@/lib/join-url";
import {
  buttonSecondaryClassName,
  cn,
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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className={pageTitleClassName}>{quiz.title}</h1>
          <p className={pageDescriptionClassName}>
            {quiz.questionCount} question{quiz.questionCount === 1 ? "" : "s"} ·{" "}
            {isThisQuizLive
              ? "Live now"
              : hasSessions
                ? `${quiz.sessions.length} session${quiz.sessions.length === 1 ? "" : "s"} recorded`
                : "Not launched yet"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/teacher/quizzes"
            className={cn(
              buttonSecondaryClassName,
              "inline-flex items-center",
            )}>
            Back to list
          </Link>
          <Link
            href={`/teacher/quizzes/${quiz.id}/edit`}
            className={cn(
              buttonSecondaryClassName,
              "inline-flex items-center",
            )}>
            Edit
          </Link>
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
          This quiz has session history. Editing will erase all sessions,
          attempts, and results. Deleting removes the quiz entirely.
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
