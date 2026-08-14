import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteQuizButton } from "@/components/quizzes/delete-quiz-button";
import { LaunchQuizPanel } from "@/components/sessions/launch-quiz-panel";
import { getJoinUrl } from "@/lib/join-url";
import {
  buttonSecondaryClassName,
  cn,
  pageDescriptionClassName,
  pageTitleClassName,
  panelClassName,
} from "@/lib/utils";
import { getQuizById } from "@/server/actions/quizzes";
import {
  getActiveSession,
  getActiveSessionAttemptCount,
} from "@/server/actions/sessions";

type QuizDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuizDetailPage({ params }: QuizDetailPageProps) {
  const { id } = await params;
  const [quiz, activeSession, joinUrl] = await Promise.all([
    getQuizById(id),
    getActiveSession(),
    getJoinUrl(),
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
          {!hasSessions ? (
            <>
              <Link
                href={`/teacher/quizzes/${quiz.id}/edit`}
                className={cn(
                  buttonSecondaryClassName,
                  "inline-flex items-center",
                )}>
                Edit
              </Link>
              <DeleteQuizButton quizId={quiz.id} quizTitle={quiz.title} />
            </>
          ) : null}
        </div>
      </div>

      {hasSessions ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          This quiz has been used in a session and can no longer be edited or
          deleted.
        </p>
      ) : null}

      <LaunchQuizPanel
        quizId={quiz.id}
        quizTitle={quiz.title}
        joinUrl={joinUrl}
        activeSession={activeSession}
        joinedCount={joinedCount}
      />

      <div className="space-y-4">
        {quiz.questions.map((question, index) => {
          const correctOption = question.options.find(
            (option) => option.isCorrect,
          );

          return (
            <article
              key={question.id}
              className={`${panelClassName} space-y-3`}>
              <h2 className="font-medium text-zinc-900">
                {index + 1}. {question.prompt}
              </h2>
              <ul className="space-y-2">
                {question.options.map((option) => {
                  const letter = String.fromCharCode(65 + option.orderIndex);
                  const isCorrect = option.id === correctOption?.id;

                  return (
                    <li
                      key={option.id}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm",
                        isCorrect
                          ? "border-green-200 bg-green-50 text-green-900"
                          : "border-zinc-200 bg-zinc-50 text-zinc-800",
                      )}>
                      <span className="font-mono font-medium">{letter})</span>{" "}
                      {option.text}
                      {isCorrect ? (
                        <span className="ml-2 text-xs font-medium uppercase tracking-wide text-green-700">
                          Correct
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </div>
    </div>
  );
}
