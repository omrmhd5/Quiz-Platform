import Link from "next/link";
import {
  buttonPrimaryClassName,
  cn,
  enterClassName,
  pageDescriptionClassName,
  pageTitleClassName,
  panelClassName,
} from "@/lib/utils";
import { getAttemptById } from "@/server/actions/sessions";

type QuizAttemptPageProps = {
  params: Promise<{ attemptId: string }>;
};

export default async function QuizAttemptPage({
  params,
}: QuizAttemptPageProps) {
  const { attemptId } = await params;
  const attempt = await getAttemptById(attemptId);

  const quizTitle = attempt.session.quiz.title;
  const studentName = attempt.student.name;
  const isSubmitted = attempt.status === "submitted";
  const sessionClosed = attempt.session.status === "closed";

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className={cn("w-full max-w-lg space-y-8", enterClassName)}>
        <div className="text-center">
          <h1 className={pageTitleClassName}>{quizTitle}</h1>
          <p className={pageDescriptionClassName}>
            {studentName} · {isSubmitted ? "Submitted" : "Ready to start"}
          </p>
        </div>

        <div className={`${panelClassName} space-y-4 text-center`}>
          {isSubmitted ? (
            <>
              <p className="text-sm text-zinc-700">
                You have already submitted this quiz. Results will appear here
                in a later update.
              </p>
              <Link href="/join" className={buttonPrimaryClassName}>
                Back to join
              </Link>
            </>
          ) : sessionClosed ? (
            <>
              <p className="text-sm text-zinc-700">
                This quiz session has ended. Contact your teacher if you still
                need to participate.
              </p>
              <Link href="/join" className={buttonPrimaryClassName}>
                Back to join
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-zinc-700">
                Your attempt is ready. The full quiz experience — shuffled
                questions, answering, and submit — arrives in Increment 5.
              </p>
              <button type="button" disabled className={buttonPrimaryClassName}>
                Start quiz (coming soon)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
