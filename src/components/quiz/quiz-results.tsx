import Link from "next/link";
import {
  buttonPrimaryClassName,
  cn,
  enterClassName,
  pageDescriptionClassName,
  pageTitleClassName,
  panelClassName,
  scoreHeroClassName,
  statCardClassName,
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

        <div className="grid grid-cols-3 gap-3">
          <div className={cn(statCardClassName, "px-3 py-4")}>
            <p className="text-2xl font-semibold tabular-nums text-green-700">
              {results.correctCount}
            </p>
            <p className="mt-1 text-xs text-zinc-600">Correct</p>
          </div>
          <div className={cn(statCardClassName, "px-3 py-4")}>
            <p className="text-2xl font-semibold tabular-nums text-red-700">
              {results.wrongCount}
            </p>
            <p className="mt-1 text-xs text-zinc-600">Wrong</p>
          </div>
          <div className={cn(statCardClassName, "px-3 py-4")}>
            <p className="text-2xl font-semibold tabular-nums text-zinc-700">
              {results.unansweredCount}
            </p>
            <p className="mt-1 text-xs text-zinc-600">Skipped</p>
          </div>
        </div>

        <Link
          href="/join"
          className={cn(
            buttonPrimaryClassName,
            "inline-flex w-full justify-center",
          )}>
          Back to join
        </Link>
      </div>
    </div>
  );
}
