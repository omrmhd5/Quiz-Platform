import { pageDescriptionClassName, pageTitleClassName, panelClassName } from "@/lib/utils";

export default function QuizzesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className={pageTitleClassName}>Quizzes</h1>
        <p className={pageDescriptionClassName}>
          Create, save, and launch multiple-choice quizzes.
        </p>
      </div>

      <div className={`${panelClassName} border-dashed text-center`}>
        <p className="text-sm text-zinc-600">
          Quiz creation will be available in the next increment.
        </p>
      </div>
    </div>
  );
}
