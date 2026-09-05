import { QuizForm } from "@/components/quizzes/quiz-form";
import { getRequestLocale } from "@/lib/i18n/server";
import { getMessage } from "@/lib/i18n/messages";
import { pageDescriptionClassName, pageTitleClassName } from "@/lib/utils";

export default async function NewQuizPage() {
  const locale = await getRequestLocale();
  return (
    <div id="quiz-form-page" className="space-y-8">
      <div>
        <h1 className={pageTitleClassName}>{getMessage(locale, "quizzes.newTitle")}</h1>
        <p className={pageDescriptionClassName}>
          {getMessage(locale, "quizzes.newDescription")}
        </p>
      </div>

      <QuizForm mode="create" />
    </div>
  );
}
