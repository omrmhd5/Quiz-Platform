import { StatCard } from "@/components/stat-display";
import { ActionLink } from "@/components/ui/action-control";
import {
  cn,
  enterClassName,
  pageDescriptionClassName,
  pageTitleClassName,
  panelClassName,
  scoreHeroClassName,
} from "@/lib/utils";
import type { AttemptResultsView } from "@/lib/attempts";

type QuizResultsProps = {
  results: AttemptResultsView;
};

export function QuizResults({ results }: QuizResultsProps) {
  return (
    <div className={cn("w-full max-w-lg space-y-8", enterClassName)}>
      <div className="text-center">
        <h1 className={pageTitleClassName}>{results.quizTitle}</h1>
        <p className={pageDescriptionClassName}>
          {results.studentName} · Submitted
        </p>
      </div>

      <div className={`${panelClassName} space-y-6 text-center`}>
        <div>
          <p className="text-sm font-medium text-zinc-600">Your score</p>
          <p className={cn(scoreHeroClassName, "mt-2")}>
            {results.scorePercent}%
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Correct"
            value={results.correctCount}
            preset="correct"
            className="px-3 py-4 text-center [&_.ui-stat-card__icon]:mx-auto"
          />
          <StatCard
            label="Wrong"
            value={results.wrongCount}
            preset="wrong"
            className="px-3 py-4 text-center [&_.ui-stat-card__icon]:mx-auto"
          />
          <StatCard
            label="Skipped"
            value={results.unansweredCount}
            preset="skipped"
            className="px-3 py-4 text-center [&_.ui-stat-card__icon]:mx-auto"
          />
        </div>

        <ActionLink
          action="join"
          label="Back to join"
          href="/join"
          size="md"
          className="w-full justify-center"
        />
      </div>
    </div>
  );
}
