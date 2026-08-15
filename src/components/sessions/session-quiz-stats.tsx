import type { SessionQuestionStat } from "@/lib/session-results";
import { SectionIntro } from "@/components/section-intro";
import { StatCard } from "@/components/stat-display";
import {
  cn,
  emptyStateClassName,
  panelClassName,
} from "@/lib/utils";

type SessionQuizStatsProps = {
  questionStats: SessionQuestionStat[];
  submittedCount: number;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
};

function getHighlightedQuestions(questionStats: SessionQuestionStat[]) {
  const answered = questionStats.filter(
    (question) =>
      question.answeredCount > 0 && question.correctPercent !== null,
  );

  if (answered.length === 0) {
    return { mostMissed: null, easiest: null };
  }

  const mostMissed = answered.reduce((lowest, question) =>
    (question.correctPercent ?? 100) < (lowest.correctPercent ?? 100)
      ? question
      : lowest,
  );

  const easiest = answered.reduce((highest, question) =>
    (question.correctPercent ?? 0) > (highest.correctPercent ?? 0)
      ? question
      : highest,
  );

  return { mostMissed, easiest };
}

export function SessionQuizStats({
  questionStats,
  submittedCount,
  totalCorrect,
  totalWrong,
  totalSkipped,
}: SessionQuizStatsProps) {
  const { mostMissed, easiest } = getHighlightedQuestions(questionStats);

  if (questionStats.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <SectionIntro
        title="Quiz stats"
        titleAs="h3"
        description={`Based on ${submittedCount} submitted attempt${submittedCount === 1 ? "" : "s"}.`}
      />

      {submittedCount === 0 ? (
        <p className={emptyStateClassName}>
          No submissions yet — question stats will appear after students submit.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Total correct"
              value={totalCorrect}
              preset="correct"
            />
            <StatCard label="Total wrong" value={totalWrong} preset="wrong" />
            <StatCard
              label="Total skipped"
              value={totalSkipped}
              preset="skipped"
            />
          </div>

          {(mostMissed || easiest) &&
          mostMissed?.questionId !== easiest?.questionId ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {mostMissed ? (
                <div className={`${panelClassName} space-y-1`}>
                  <p className="text-xs font-medium uppercase tracking-wide text-red-700">
                    Most missed
                  </p>
                  <p className="text-sm font-medium leading-snug text-zinc-900">
                    {mostMissed.orderIndex + 1}. {mostMissed.prompt}
                  </p>
                  <p className="text-sm tabular-nums text-zinc-600">
                    {mostMissed.correctPercent}% correct
                  </p>
                </div>
              ) : null}
              {easiest ? (
                <div className={`${panelClassName} space-y-1`}>
                  <p className="text-xs font-medium uppercase tracking-wide text-green-700">
                    Easiest
                  </p>
                  <p className="text-sm font-medium leading-snug text-zinc-900">
                    {easiest.orderIndex + 1}. {easiest.prompt}
                  </p>
                  <p className="text-sm tabular-nums text-zinc-600">
                    {easiest.correctPercent}% correct
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className={`${panelClassName} space-y-3`}>
            <p className="text-sm font-medium text-zinc-900">
              Correct rate by question
            </p>
            <ul className="space-y-3">
              {questionStats.map((question) => (
                <li key={question.questionId} className="space-y-1.5">
                  <div className="flex items-start justify-between gap-3 text-sm">
                    <p className="min-w-0 leading-snug text-zinc-800">
                      <span className="font-medium text-zinc-900">
                        {question.orderIndex + 1}.
                      </span>{" "}
                      {question.prompt}
                    </p>
                    <span className="shrink-0 tabular-nums text-zinc-600">
                      {question.correctPercent !== null
                        ? `${question.correctPercent}%`
                        : "—"}
                    </span>
                  </div>
                  <div className="ui-progress-track">
                    <div
                      className={cn(
                        "ui-progress-fill",
                        question.correctPercent === null
                          ? "w-0"
                          : question.correctPercent >= 70
                            ? "ui-progress-fill-good"
                            : question.correctPercent >= 40
                              ? "ui-progress-fill-warn"
                              : "ui-progress-fill-bad",
                      )}
                      style={{
                        width:
                          question.correctPercent !== null
                            ? `${question.correctPercent}%`
                            : "0%",
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
