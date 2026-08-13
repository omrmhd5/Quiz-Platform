import { QuizForm } from "@/components/quizzes/quiz-form";
import { pageDescriptionClassName, pageTitleClassName } from "@/lib/utils";

export default function NewQuizPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className={pageTitleClassName}>Create quiz</h1>
        <p className={pageDescriptionClassName}>
          Build questions one-by-one or paste a block of text, then save.
        </p>
      </div>

      <QuizForm mode="create" />
    </div>
  );
}
