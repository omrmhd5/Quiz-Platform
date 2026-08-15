import { and, eq, sql } from "drizzle-orm";
import type { Database } from "@/db";
import {
  attempts,
  sessionQuestionStats,
  sessionStats,
  studentStats,
  teacherStats,
} from "@/db/schema";
import { averageFromSum, roundScore } from "@/lib/scores";

type DbExecutor = Pick<Database, "insert" | "update" | "select" | "execute">;

export type SubmittedAnswerStat = {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
};

export type AttemptSubmittedPayload = {
  sessionId: string;
  studentId: string;
  teacherId: string;
  sessionStatus: "waiting" | "active" | "closed";
  scorePercent: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  answers: SubmittedAnswerStat[];
};

async function ensureTeacherStatsRow(tx: DbExecutor, teacherId: string) {
  await tx
    .insert(teacherStats)
    .values({ teacherId })
    .onConflictDoNothing({ target: teacherStats.teacherId });
}

async function ensureStudentStatsRow(tx: DbExecutor, studentId: string) {
  await tx
    .insert(studentStats)
    .values({ studentId })
    .onConflictDoNothing({ target: studentStats.studentId });
}

async function ensureSessionStatsRow(tx: DbExecutor, sessionId: string) {
  await tx
    .insert(sessionStats)
    .values({ sessionId })
    .onConflictDoNothing({ target: sessionStats.sessionId });
}

function nextHighLow(
  currentHigh: number | null,
  currentLow: number | null,
  score: number,
) {
  return {
    highestScore: currentHigh === null ? score : Math.max(currentHigh, score),
    lowestScore: currentLow === null ? score : Math.min(currentLow, score),
  };
}

export async function applySessionLaunched(
  tx: DbExecutor,
  sessionId: string,
  teacherId: string,
) {
  await ensureSessionStatsRow(tx, sessionId);
  await ensureTeacherStatsRow(tx, teacherId);

  await tx
    .update(teacherStats)
    .set({
      sessionCount: sql`${teacherStats.sessionCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(teacherStats.teacherId, teacherId));
}

export async function applySessionClosed(
  tx: DbExecutor,
  sessionId: string,
  teacherId: string,
) {
  await ensureSessionStatsRow(tx, sessionId);
  await ensureTeacherStatsRow(tx, teacherId);

  const inProgressAttempts = await tx
    .select({ studentId: attempts.studentId })
    .from(attempts)
    .where(
      and(
        eq(attempts.sessionId, sessionId),
        eq(attempts.status, "in_progress"),
      ),
    );

  const inProgressCount = inProgressAttempts.length;

  if (inProgressCount === 0) {
    return;
  }

  await tx
    .update(teacherStats)
    .set({
      liveInProgressCount: sql`greatest(${teacherStats.liveInProgressCount} - ${inProgressCount}, 0)`,
      didntFinishCount: sql`${teacherStats.didntFinishCount} + ${inProgressCount}`,
      updatedAt: new Date(),
    })
    .where(eq(teacherStats.teacherId, teacherId));

  for (const row of inProgressAttempts) {
    await ensureStudentStatsRow(tx, row.studentId);
    await tx
      .update(studentStats)
      .set({
        didntFinishCount: sql`${studentStats.didntFinishCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(studentStats.studentId, row.studentId));
  }
}

export async function applyAttemptJoined(
  tx: DbExecutor,
  sessionId: string,
  studentId: string,
  teacherId: string,
) {
  await ensureSessionStatsRow(tx, sessionId);
  await ensureStudentStatsRow(tx, studentId);
  await ensureTeacherStatsRow(tx, teacherId);

  await tx
    .update(sessionStats)
    .set({
      joinedCount: sql`${sessionStats.joinedCount} + 1`,
      inProgressCount: sql`${sessionStats.inProgressCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(sessionStats.sessionId, sessionId));

  await tx
    .update(studentStats)
    .set({
      attemptCount: sql`${studentStats.attemptCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(studentStats.studentId, studentId));

  await tx
    .update(teacherStats)
    .set({
      totalAttempts: sql`${teacherStats.totalAttempts} + 1`,
      liveInProgressCount: sql`${teacherStats.liveInProgressCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(teacherStats.teacherId, teacherId));
}

export async function applyAttemptSubmitted(
  tx: DbExecutor,
  payload: AttemptSubmittedPayload,
) {
  const {
    sessionId,
    studentId,
    teacherId,
    sessionStatus,
    scorePercent,
    correctCount,
    wrongCount,
    unansweredCount,
    answers,
  } = payload;

  await ensureSessionStatsRow(tx, sessionId);
  await ensureStudentStatsRow(tx, studentId);
  await ensureTeacherStatsRow(tx, teacherId);

  const [currentSessionStats] = await tx
    .select({
      submittedCount: sessionStats.submittedCount,
      submittedScoreSum: sessionStats.submittedScoreSum,
      highestScore: sessionStats.highestScore,
      lowestScore: sessionStats.lowestScore,
    })
    .from(sessionStats)
    .where(eq(sessionStats.sessionId, sessionId))
    .limit(1);

  const sessionSubmittedCount = (currentSessionStats?.submittedCount ?? 0) + 1;
  const sessionScoreSum =
    (currentSessionStats?.submittedScoreSum ?? 0) + scorePercent;
  const sessionHighLow = nextHighLow(
    currentSessionStats?.highestScore ?? null,
    currentSessionStats?.lowestScore ?? null,
    scorePercent,
  );

  await tx
    .update(sessionStats)
    .set({
      submittedCount: sql`${sessionStats.submittedCount} + 1`,
      inProgressCount: sql`greatest(${sessionStats.inProgressCount} - 1, 0)`,
      submittedScoreSum: sql`${sessionStats.submittedScoreSum} + ${scorePercent}`,
      averageScore: averageFromSum(sessionScoreSum, sessionSubmittedCount),
      highestScore: sessionHighLow.highestScore,
      lowestScore: sessionHighLow.lowestScore,
      totalCorrect: sql`${sessionStats.totalCorrect} + ${correctCount}`,
      totalWrong: sql`${sessionStats.totalWrong} + ${wrongCount}`,
      totalSkipped: sql`${sessionStats.totalSkipped} + ${unansweredCount}`,
      updatedAt: new Date(),
    })
    .where(eq(sessionStats.sessionId, sessionId));

  const [currentStudentStats] = await tx
    .select({
      submittedCount: studentStats.submittedCount,
      submittedScoreSum: studentStats.submittedScoreSum,
      highestScore: studentStats.highestScore,
      lowestScore: studentStats.lowestScore,
    })
    .from(studentStats)
    .where(eq(studentStats.studentId, studentId))
    .limit(1);

  const studentSubmittedCount = (currentStudentStats?.submittedCount ?? 0) + 1;
  const studentScoreSum =
    (currentStudentStats?.submittedScoreSum ?? 0) + scorePercent;
  const studentHighLow = nextHighLow(
    currentStudentStats?.highestScore ?? null,
    currentStudentStats?.lowestScore ?? null,
    scorePercent,
  );

  await tx
    .update(studentStats)
    .set({
      submittedCount: sql`${studentStats.submittedCount} + 1`,
      ...(sessionStatus === "closed"
        ? {
            didntFinishCount: sql`greatest(${studentStats.didntFinishCount} - 1, 0)`,
          }
        : {}),
      submittedScoreSum: sql`${studentStats.submittedScoreSum} + ${scorePercent}`,
      averageScore: averageFromSum(studentScoreSum, studentSubmittedCount),
      highestScore: studentHighLow.highestScore,
      lowestScore: studentHighLow.lowestScore,
      totalCorrect: sql`${studentStats.totalCorrect} + ${correctCount}`,
      totalWrong: sql`${studentStats.totalWrong} + ${wrongCount}`,
      totalSkipped: sql`${studentStats.totalSkipped} + ${unansweredCount}`,
      updatedAt: new Date(),
    })
    .where(eq(studentStats.studentId, studentId));

  const [currentTeacherStats] = await tx
    .select({
      submittedCount: teacherStats.submittedCount,
      submittedScoreSum: teacherStats.submittedScoreSum,
    })
    .from(teacherStats)
    .where(eq(teacherStats.teacherId, teacherId))
    .limit(1);

  const teacherSubmittedCount = (currentTeacherStats?.submittedCount ?? 0) + 1;
  const teacherScoreSum =
    (currentTeacherStats?.submittedScoreSum ?? 0) + scorePercent;

  const teacherUpdate =
    sessionStatus === "active"
      ? {
          submittedCount: sql`${teacherStats.submittedCount} + 1`,
          liveInProgressCount: sql`greatest(${teacherStats.liveInProgressCount} - 1, 0)`,
          submittedScoreSum: sql`${teacherStats.submittedScoreSum} + ${scorePercent}`,
          overallAverageScore: averageFromSum(
            teacherScoreSum,
            teacherSubmittedCount,
          ),
          totalCorrect: sql`${teacherStats.totalCorrect} + ${correctCount}`,
          totalWrong: sql`${teacherStats.totalWrong} + ${wrongCount}`,
          totalSkipped: sql`${teacherStats.totalSkipped} + ${unansweredCount}`,
          updatedAt: new Date(),
        }
      : {
          submittedCount: sql`${teacherStats.submittedCount} + 1`,
          didntFinishCount: sql`greatest(${teacherStats.didntFinishCount} - 1, 0)`,
          submittedScoreSum: sql`${teacherStats.submittedScoreSum} + ${scorePercent}`,
          overallAverageScore: averageFromSum(
            teacherScoreSum,
            teacherSubmittedCount,
          ),
          totalCorrect: sql`${teacherStats.totalCorrect} + ${correctCount}`,
          totalWrong: sql`${teacherStats.totalWrong} + ${wrongCount}`,
          totalSkipped: sql`${teacherStats.totalSkipped} + ${unansweredCount}`,
          updatedAt: new Date(),
        };

  await tx
    .update(teacherStats)
    .set(teacherUpdate)
    .where(eq(teacherStats.teacherId, teacherId));

  for (const answer of answers) {
    if (!answer.selectedOptionId) {
      continue;
    }

    await tx
      .insert(sessionQuestionStats)
      .values({
        sessionId,
        questionId: answer.questionId,
        answeredCount: 1,
        correctCount: answer.isCorrect ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: [
          sessionQuestionStats.sessionId,
          sessionQuestionStats.questionId,
        ],
        set: {
          answeredCount: sql`${sessionQuestionStats.answeredCount} + 1`,
          correctCount: answer.isCorrect
            ? sql`${sessionQuestionStats.correctCount} + 1`
            : sessionQuestionStats.correctCount,
        },
      });
  }
}

export async function applyQuizCreated(tx: DbExecutor, teacherId: string) {
  await ensureTeacherStatsRow(tx, teacherId);
  await tx
    .update(teacherStats)
    .set({
      quizCount: sql`${teacherStats.quizCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(teacherStats.teacherId, teacherId));
}

export async function applyQuizDeleted(tx: DbExecutor, teacherId: string) {
  await ensureTeacherStatsRow(tx, teacherId);
  await tx
    .update(teacherStats)
    .set({
      quizCount: sql`greatest(${teacherStats.quizCount} - 1, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(teacherStats.teacherId, teacherId));
}

export async function syncTeacherStatsFromRollups(
  tx: DbExecutor,
  teacherId: string,
) {
  await tx.execute(sql`
    insert into teacher_stats (
      teacher_id,
      quiz_count,
      session_count,
      total_attempts,
      submitted_count,
      live_in_progress_count,
      didnt_finish_count,
      submitted_score_sum,
      overall_average_score,
      total_correct,
      total_wrong,
      total_skipped,
      updated_at
    )
    select
      ${teacherId},
      (select count(*)::int from quizzes where teacher_id = ${teacherId}),
      (select count(*)::int from quiz_sessions qs
        inner join quizzes q on q.id = qs.quiz_id
        where q.teacher_id = ${teacherId}),
      (select count(*)::int from attempts a
        inner join quiz_sessions qs on qs.id = a.session_id
        inner join quizzes q on q.id = qs.quiz_id
        where q.teacher_id = ${teacherId}),
      (select count(*)::int from attempts a
        inner join quiz_sessions qs on qs.id = a.session_id
        inner join quizzes q on q.id = qs.quiz_id
        where q.teacher_id = ${teacherId} and a.status = 'submitted'),
      (select count(*)::int from attempts a
        inner join quiz_sessions qs on qs.id = a.session_id
        inner join quizzes q on q.id = qs.quiz_id
        where q.teacher_id = ${teacherId}
          and a.status = 'in_progress'
          and qs.status = 'active'),
      (select count(*)::int from attempts a
        inner join quiz_sessions qs on qs.id = a.session_id
        inner join quizzes q on q.id = qs.quiz_id
        where q.teacher_id = ${teacherId}
          and a.status = 'in_progress'
          and qs.status = 'closed'),
      coalesce((select sum(a.score_percent) from attempts a
        inner join quiz_sessions qs on qs.id = a.session_id
        inner join quizzes q on q.id = qs.quiz_id
        where q.teacher_id = ${teacherId} and a.status = 'submitted'), 0),
      (select round(avg(a.score_percent)::numeric, 1) from attempts a
        inner join quiz_sessions qs on qs.id = a.session_id
        inner join quizzes q on q.id = qs.quiz_id
        where q.teacher_id = ${teacherId} and a.status = 'submitted'),
      coalesce((select sum(a.correct_count) from attempts a
        inner join quiz_sessions qs on qs.id = a.session_id
        inner join quizzes q on q.id = qs.quiz_id
        where q.teacher_id = ${teacherId} and a.status = 'submitted'), 0),
      coalesce((select sum(a.wrong_count) from attempts a
        inner join quiz_sessions qs on qs.id = a.session_id
        inner join quizzes q on q.id = qs.quiz_id
        where q.teacher_id = ${teacherId} and a.status = 'submitted'), 0),
      coalesce((select sum(a.unanswered_count) from attempts a
        inner join quiz_sessions qs on qs.id = a.session_id
        inner join quizzes q on q.id = qs.quiz_id
        where q.teacher_id = ${teacherId} and a.status = 'submitted'), 0),
      now()
    on conflict (teacher_id) do update set
      quiz_count = excluded.quiz_count,
      session_count = excluded.session_count,
      total_attempts = excluded.total_attempts,
      submitted_count = excluded.submitted_count,
      live_in_progress_count = excluded.live_in_progress_count,
      didnt_finish_count = excluded.didnt_finish_count,
      submitted_score_sum = excluded.submitted_score_sum,
      overall_average_score = excluded.overall_average_score,
      total_correct = excluded.total_correct,
      total_wrong = excluded.total_wrong,
      total_skipped = excluded.total_skipped,
      updated_at = excluded.updated_at
  `);
}

export async function syncAllStudentStatsFromRollups(tx: DbExecutor) {
  await tx.execute(sql`
    insert into student_stats (
      student_id,
      attempt_count,
      submitted_count,
      didnt_finish_count,
      submitted_score_sum,
      average_score,
      highest_score,
      lowest_score,
      total_correct,
      total_wrong,
      total_skipped,
      updated_at
    )
    select
      s.id,
      coalesce(count(a.id), 0)::int,
      coalesce(count(a.id) filter (where a.status = 'submitted'), 0)::int,
      coalesce(count(a.id) filter (
        where a.status = 'in_progress' and qs.status = 'closed'
      ), 0)::int,
      coalesce(sum(a.score_percent) filter (where a.status = 'submitted'), 0),
      round(avg(a.score_percent) filter (where a.status = 'submitted')::numeric, 1),
      max(a.score_percent) filter (where a.status = 'submitted'),
      min(a.score_percent) filter (where a.status = 'submitted'),
      coalesce(sum(a.correct_count) filter (where a.status = 'submitted'), 0)::int,
      coalesce(sum(a.wrong_count) filter (where a.status = 'submitted'), 0)::int,
      coalesce(sum(a.unanswered_count) filter (where a.status = 'submitted'), 0)::int,
      now()
    from students s
    left join attempts a on a.student_id = s.id
    left join quiz_sessions qs on qs.id = a.session_id
    group by s.id
    on conflict (student_id) do update set
      attempt_count = excluded.attempt_count,
      submitted_count = excluded.submitted_count,
      didnt_finish_count = excluded.didnt_finish_count,
      submitted_score_sum = excluded.submitted_score_sum,
      average_score = excluded.average_score,
      highest_score = excluded.highest_score,
      lowest_score = excluded.lowest_score,
      total_correct = excluded.total_correct,
      total_wrong = excluded.total_wrong,
      total_skipped = excluded.total_skipped,
      updated_at = excluded.updated_at
  `);

  await tx.execute(sql`
    delete from student_stats
    where student_id not in (select id from students)
  `);
}

export async function syncStatsAfterHistoryRemoved(
  tx: DbExecutor,
  teacherId: string,
) {
  await syncTeacherStatsFromRollups(tx, teacherId);
  await syncAllStudentStatsFromRollups(tx);
}

export function mapQuestionCorrectPercent(
  answeredCount: number,
  correctCount: number,
) {
  if (answeredCount <= 0) {
    return null;
  }

  return roundScore((correctCount / answeredCount) * 100);
}
