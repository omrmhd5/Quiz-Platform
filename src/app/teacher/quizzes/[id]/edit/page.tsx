import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { QuizForm } from "@/components/quizzes/quiz-form";
import { quizQuestionsToPayload } from "@/lib/quizzes";
import {
  buttonSecondaryClassName,
  cn,
  pageDescriptionClassName,
  pageTitleClassName,
} from "@/lib/utils";
import { getQuizById } from "@/server/actions/quizzes";

type EditQuizPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditQuizPage({ params }: EditQuizPageProps) {
  const { id } = await params;
  const quiz = await getQuizById(id);

  if (!quiz) {
    notFound();
  }

  if (quiz.sessions.length > 0) {
    redirect(`/teacher/quizzes/${quiz.id}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={pageTitleClassName}>Edit quiz</h1>
          <p className={pageDescriptionClassName}>
            Update questions or correct answers for &ldquo;{quiz.title}&rdquo;.
          </p>
        </div>
        <Link
          href={`/teacher/quizzes/${quiz.id}`}
          className={cn(buttonSecondaryClassName, "inline-flex items-center")}
        >
          Cancel
        </Link>
      </div>

      <QuizForm
        mode="edit"
        quizId={quiz.id}
        initialData={{
          title: quiz.title,
          questions: quizQuestionsToPayload(quiz.questions),
        }}
      />
    </div>
  );
}
