import Link from "next/link";
import { ActiveSessionBanner } from "@/components/sessions/active-session-banner";
import { LaunchQuizButton } from "@/components/sessions/launch-quiz-button";
import { getJoinUrl } from "@/lib/join-url";
import {
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  cn,
  pageDescriptionClassName,
  pageTitleClassName,
  panelClassName,
} from "@/lib/utils";
import { getQuizzes } from "@/server/actions/quizzes";
import {
  getActiveSession,
  getActiveSessionAttemptCount,
} from "@/server/actions/sessions";

export default async function QuizzesPage() {
  const [quizRows, activeSession, joinUrl] = await Promise.all([
    getQuizzes(),
    getActiveSession(),
    getJoinUrl(),
  ]);

  const joinedCount =
    activeSession !== null
      ? await getActiveSessionAttemptCount(activeSession.sessionId)
      : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={pageTitleClassName}>Quizzes</h1>
          <p className={pageDescriptionClassName}>
            Create, save, and manage multiple-choice quizzes.
          </p>
        </div>
        <Link
          href="/teacher/quizzes/new"
          className={cn(buttonPrimaryClassName, "inline-flex items-center")}>
          Create quiz
        </Link>
      </div>

      {activeSession ? (
        <ActiveSessionBanner
          activeSession={activeSession}
          joinUrl={joinUrl}
          joinedCount={joinedCount}
        />
      ) : null}

      {quizRows.length === 0 ? (
        <div className={`${panelClassName} border-dashed text-center`}>
          <p className="text-sm text-zinc-600">
            No quizzes yet. Create your first MCQ quiz to get started.
          </p>
          <Link
            href="/teacher/quizzes/new"
            className={cn(
              buttonPrimaryClassName,
              "mt-4 inline-flex items-center",
            )}>
            Create quiz
          </Link>
        </div>
      ) : (
        <div className={`${panelClassName} overflow-x-auto`}>
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Questions</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Created</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {quizRows.map((quiz) => {
                const isLive = activeSession?.quizId === quiz.id;

                return (
                  <tr key={quiz.id} className="ui-table-row">
                    <td className="px-3 py-3 font-medium text-zinc-900">
                      <Link
                        href={`/teacher/quizzes/${quiz.id}`}
                        className="rounded-sm underline decoration-zinc-300 underline-offset-2 transition-colors hover:text-zinc-600 hover:decoration-zinc-500">
                        {quiz.title}
                      </Link>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-zinc-700">
                      {quiz.questionCount}
                    </td>
                    <td className="px-3 py-3">
                      {isLive ? (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Live
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium capitalize text-zinc-700">
                          {quiz.status}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-zinc-600">
                      {quiz.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <LaunchQuizButton
                          quizId={quiz.id}
                          quizTitle={quiz.title}
                          questionCount={quiz.questionCount}
                          activeSession={activeSession}
                        />
                        <Link
                          href={`/teacher/quizzes/${quiz.id}`}
                          className={cn(buttonSecondaryClassName, "ui-btn-sm")}>
                          View
                        </Link>
                        <Link
                          href={`/teacher/quizzes/${quiz.id}/edit`}
                          className={cn(buttonSecondaryClassName, "ui-btn-sm")}>
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
