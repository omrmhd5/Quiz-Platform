import { QuizResults } from "@/components/quiz/quiz-results";
import { QuizTaker } from "@/components/quiz/quiz-taker";
import { ActionLink } from "@/components/ui/action-control";
import { getRequestLocale } from "@/lib/i18n/server";
import { getMessage } from "@/lib/i18n/messages";
import {
  cn,
  enterClassName,
  pageDescriptionClassName,
  pageTitleClassName,
  panelClassName,
} from "@/lib/utils";
import {
  getAttemptPageState,
  getAttemptQuizView,
  getAttemptResults,
} from "@/server/actions/attempts";

type QuizAttemptPageProps = {
  params: Promise<{ attemptId: string }>;
};

export default async function QuizAttemptPage({
  params,
}: QuizAttemptPageProps) {
  const { attemptId } = await params;
  const locale = await getRequestLocale();
  const pageState = await getAttemptPageState(attemptId);

  if (pageState.status === "submitted") {
    const results = await getAttemptResults(attemptId);

    return (
      <div className="flex min-h-dvh items-center justify-center px-4 py-12">
        <QuizResults results={results} />
      </div>
    );
  }

  if (pageState.sessionStatus === "closed") {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4 py-12">
        <div className={cn("w-full max-w-lg space-y-8", enterClassName)}>
          <div className="text-center">
            <h1 className={pageTitleClassName}>{pageState.quizTitle}</h1>
            <p className={pageDescriptionClassName}>{pageState.studentName}</p>
          </div>

          <div className={`${panelClassName} space-y-4 text-center`}>
            <p className="text-sm text-zinc-700">
              {getMessage(locale, "quizTake.sessionEnded")}
            </p>
            <ActionLink
              action="join"
              label={getMessage(locale, "quizTake.backToJoin")}
              href="/join"
              size="md"
              className="inline-flex w-full justify-center"
            />
          </div>
        </div>
      </div>
    );
  }

  const quiz = await getAttemptQuizView(attemptId);

  return <QuizTaker quiz={quiz} />;
}
