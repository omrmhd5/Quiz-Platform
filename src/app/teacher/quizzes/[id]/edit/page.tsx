import { notFound } from "next/navigation";
import { QuizForm } from "@/components/quizzes/quiz-form";
import { ActionLink } from "@/components/ui/action-control";
import { quizQuestionsToPayload } from "@/lib/quizzes";
import { getRequestLocale } from "@/lib/i18n/server";
import { getMessage } from "@/lib/i18n/messages";
import {
  pageDescriptionClassName,
  pageTitleClassName,
} from "@/lib/utils";
import { getQuizById } from "@/server/actions/quizzes";
import { getActiveSession } from "@/server/actions/sessions";

type EditQuizPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditQuizPage({ params }: EditQuizPageProps) {
  const { id } = await params;
  const locale = await getRequestLocale();
  const [quiz, activeSession] = await Promise.all([
    getQuizById(id),
    getActiveSession(),
  ]);

  if (!quiz) {
    notFound();
  }

  const sessionCount = quiz.sessions.length;
  const isLive = activeSession?.quizId === quiz.id;

  return (
    <div id="quiz-form-page" className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={pageTitleClassName}>{getMessage(locale, "quizzes.editTitle")}</h1>
          <p className={pageDescriptionClassName}>
            {getMessage(locale, "quizzes.editDescription", { title: quiz.title })}
          </p>
        </div>
        <ActionLink
          action="cancel"
          href={`/teacher/quizzes/${quiz.id}`}
          size="md"
        />
      </div>

      {sessionCount > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <p className="font-medium">{getMessage(locale, "quizzes.eraseHistoryTitle")}</p>
          <p className="mt-1">
            {getMessage(locale, "quizzes.eraseHistoryDescription", {
              count: sessionCount,
              liveNote: isLive ? ` — ${getMessage(locale, "quizzes.liveNow")}` : "",
            })}
          </p>
        </div>
      ) : null}

      <QuizForm
        mode="edit"
        quizId={quiz.id}
        sessionCount={sessionCount}
        isLive={isLive}
        initialData={{
          title: quiz.title,
          questions: quizQuestionsToPayload(quiz.questions),
        }}
      />
    </div>
  );
}
