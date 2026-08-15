import type { SessionQuestionStat } from "@/lib/session-results";
import { cn, panelClassName, statCardClassName } from "@/lib/utils";

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
  const totalQuestions = totalCorrect + totalWrong + totalSkipped;
  const overallAccuracy =
    totalQuestions > 0
      ? Math.round((totalCorrect / totalQuestions) * 1000) / 10
      : null;

  if (questionStats.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-zinc-900">Quiz stats</h3>
        <p className="mt-1 text-sm text-zinc-600">
          Based on {submittedCount} submitted attempt
          {submittedCount === 1 ? "" : "s"}.
        </p>
      </div>

      {submittedCount === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-600">
          No submissions yet — question stats will appear after students submit.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className={statCardClassName}>
              <p className="text-sm text-zinc-600">Total correct</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
                {totalCorrect}
              </p>
            </div>
            <div className={statCardClassName}>
              <p className="text-sm text-zinc-600">Total wrong</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
                {totalWrong}
              </p>
            </div>
            <div className={statCardClassName}>
              <p className="text-sm text-zinc-600">Total skipped</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
                {totalSkipped}
              </p>
            </div>
            <div className={statCardClassName}>
              <p className="text-sm text-zinc-600">Overall accuracy</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">
                {overallAccuracy !== null ? `${overallAccuracy}%` : "—"}
              </p>
            </div>
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
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        question.correctPercent === null
                          ? "w-0"
                          : question.correctPercent >= 70
                            ? "bg-green-500"
                            : question.correctPercent >= 40
                              ? "bg-amber-500"
                              : "bg-red-500",
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
