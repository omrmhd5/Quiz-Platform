"use server";

import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  attempts,
  quizSessions,
  quizzes,
  sessionStats,
  students,
  teacherStats,
} from "@/db/schema";
import { requireTeacherSession } from "@/lib/auth";
import {
  DASHBOARD_ATTEMPT_HIGHLIGHTS,
  DASHBOARD_RECENT_SESSIONS,
  DASHBOARD_TREND_SESSIONS,
  type DashboardAttemptRow,
  type DashboardSessionResultRow,
  type DashboardView,
} from "@/lib/dashboard";
import { roundScore } from "@/lib/scores";
import { syncTeacherStatsFromRollups } from "@/server/stats/rollup";

function formatTrendLabel(launchedAt: Date | null, quizTitle: string) {
  const dateLabel = launchedAt
    ? launchedAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Session";

  const shortTitle =
    quizTitle.length > 18 ? `${quizTitle.slice(0, 18)}…` : quizTitle;

  return `${dateLabel} · ${shortTitle}`;
}

function mapAttemptRow(row: {
  attemptId: string;
  studentId: string;
  studentName: string;
  quizId: string;
  quizTitle: string;
  sessionId: string;
  submittedAt: Date | null;
  scorePercent: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
}): DashboardAttemptRow {
  return {
    attemptId: row.attemptId,
    studentId: row.studentId,
    studentName: row.studentName,
    quizId: row.quizId,
    quizTitle: row.quizTitle,
    sessionId: row.sessionId,
    submittedAt: row.submittedAt,
    scorePercent: roundScore(row.scorePercent)!,
    correctCount: row.correctCount,
    wrongCount: row.wrongCount,
    unansweredCount: row.unansweredCount,
  };
}

function mapSessionResultRow(row: {
  sessionId: string;
  quizId: string;
  quizTitle: string;
  status: DashboardSessionResultRow["status"];
  launchedAt: Date | null;
  joinedCount: number;
  submittedCount: number;
  averageScore: number | null;
  highestScore: number | null;
  lowestScore: number | null;
}): DashboardSessionResultRow {
  return {
    sessionId: row.sessionId,
    quizId: row.quizId,
    quizTitle: row.quizTitle,
    status: row.status,
    launchedAt: row.launchedAt,
    joinedCount: row.joinedCount,
    submittedCount: row.submittedCount,
    averageScore: roundScore(row.averageScore),
    highestScore: roundScore(row.highestScore),
    lowestScore: roundScore(row.lowestScore),
  };
}

const attemptSelect = {
  attemptId: attempts.id,
  studentId: students.id,
  studentName: students.name,
  quizId: quizzes.id,
  quizTitle: quizzes.title,
  sessionId: quizSessions.id,
  submittedAt: attempts.submittedAt,
  scorePercent: attempts.scorePercent,
  correctCount: attempts.correctCount,
  wrongCount: attempts.wrongCount,
  unansweredCount: attempts.unansweredCount,
};

const teacherAttemptFilter = (teacherId: string) =>
  and(eq(quizzes.teacherId, teacherId), eq(attempts.status, "submitted"));

async function fetchTopAttempts(
  teacherId: string,
  direction: "highest" | "lowest",
) {
  const order =
    direction === "highest"
      ? [desc(attempts.scorePercent), desc(attempts.submittedAt)]
      : [asc(attempts.scorePercent), desc(attempts.submittedAt)];

  const rows = await db
    .select(attemptSelect)
    .from(attempts)
    .innerJoin(students, eq(attempts.studentId, students.id))
    .innerJoin(quizSessions, eq(attempts.sessionId, quizSessions.id))
    .innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
    .where(teacherAttemptFilter(teacherId))
    .orderBy(...order)
    .limit(DASHBOARD_ATTEMPT_HIGHLIGHTS);

  return rows.map(mapAttemptRow);
}

async function fetchTopSessionResults(
  teacherId: string,
  direction: "highest" | "lowest",
) {
  const rows = await db
    .select({
      sessionId: quizSessions.id,
      quizId: quizzes.id,
      quizTitle: quizzes.title,
      status: quizSessions.status,
      launchedAt: quizSessions.launchedAt,
      joinedCount: sessionStats.joinedCount,
      submittedCount: sessionStats.submittedCount,
      averageScore: sessionStats.averageScore,
      highestScore: sessionStats.highestScore,
      lowestScore: sessionStats.lowestScore,
    })
    .from(sessionStats)
    .innerJoin(quizSessions, eq(sessionStats.sessionId, quizSessions.id))
    .innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
    .where(
      and(
        eq(quizzes.teacherId, teacherId),
        sql`${sessionStats.submittedCount} > 0`,
      ),
    )
    .orderBy(
      direction === "highest"
        ? desc(sessionStats.averageScore)
        : asc(sessionStats.averageScore),
      desc(quizSessions.launchedAt),
    )
    .limit(DASHBOARD_ATTEMPT_HIGHLIGHTS);

  return rows.map((row) =>
    mapSessionResultRow({
      ...row,
      joinedCount: row.joinedCount,
    }),
  );
}

async function fetchLimitedSessions(
  teacherId: string,
  limit: number,
  order: "asc" | "desc",
) {
  const rows = await db
    .select({
      sessionId: quizSessions.id,
      quizId: quizzes.id,
      quizTitle: quizzes.title,
      status: quizSessions.status,
      launchedAt: quizSessions.launchedAt,
      joinedCount: sql<number>`coalesce(${sessionStats.joinedCount}, 0)::int`,
      submittedCount: sql<number>`coalesce(${sessionStats.submittedCount}, 0)::int`,
      averageScore: sessionStats.averageScore,
    })
    .from(quizSessions)
    .innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
    .leftJoin(sessionStats, eq(sessionStats.sessionId, quizSessions.id))
    .where(eq(quizzes.teacherId, teacherId))
    .orderBy(
      order === "desc"
        ? desc(quizSessions.launchedAt)
        : asc(quizSessions.launchedAt),
    )
    .limit(limit);

  return rows.map((row) => ({
    sessionId: row.sessionId,
    quizId: row.quizId,
    quizTitle: row.quizTitle,
    status: row.status,
    launchedAt: row.launchedAt,
    joinedCount: row.joinedCount,
    submittedCount: row.submittedCount,
    averageScore: roundScore(row.averageScore),
  }));
}

export async function getDashboardStats(): Promise<DashboardView> {
  const teacherSession = await requireTeacherSession();
  const teacherId = teacherSession.teacherId;

  let [teacherRow] = await db
    .select()
    .from(teacherStats)
    .where(eq(teacherStats.teacherId, teacherId))
    .limit(1);

  if (!teacherRow) {
    await syncTeacherStatsFromRollups(db, teacherId);
    [teacherRow] = await db
      .select()
      .from(teacherStats)
      .where(eq(teacherStats.teacherId, teacherId))
      .limit(1);
  }

  const [
    studentRow,
    limitedSessionsDesc,
    topAttemptsHighest,
    topAttemptsLowest,
    topResultsHighest,
    topResultsLowest,
  ] = await Promise.all([
    db.select({ studentCount: count(students.id) }).from(students),
    fetchLimitedSessions(
      teacherId,
      Math.max(DASHBOARD_RECENT_SESSIONS, DASHBOARD_TREND_SESSIONS),
      "desc",
    ),
    fetchTopAttempts(teacherId, "highest"),
    fetchTopAttempts(teacherId, "lowest"),
    fetchTopSessionResults(teacherId, "highest"),
    fetchTopSessionResults(teacherId, "lowest"),
  ]);

  const recentSessions = limitedSessionsDesc.slice(0, DASHBOARD_RECENT_SESSIONS);
  const trendSessionsDesc = limitedSessionsDesc;

  const scoreTrend = [...trendSessionsDesc]
    .reverse()
    .filter((session) => session.averageScore !== null)
    .map((session) => ({
      sessionId: session.sessionId,
      quizTitle: session.quizTitle,
      launchedAt: session.launchedAt,
      averageScore: session.averageScore,
      label: formatTrendLabel(session.launchedAt, session.quizTitle),
    }));

  return {
    studentCount: studentRow[0]?.studentCount ?? 0,
    quizCount: teacherRow?.quizCount ?? 0,
    sessionCount: teacherRow?.sessionCount ?? 0,
    totalAttempts: teacherRow?.totalAttempts ?? 0,
    submittedCount: teacherRow?.submittedCount ?? 0,
    liveInProgressCount: teacherRow?.liveInProgressCount ?? 0,
    didntFinishCount: teacherRow?.didntFinishCount ?? 0,
    overallAverageScore: roundScore(teacherRow?.overallAverageScore),
    totalCorrect: teacherRow?.totalCorrect ?? 0,
    totalWrong: teacherRow?.totalWrong ?? 0,
    totalSkipped: teacherRow?.totalSkipped ?? 0,
    recentSessions,
    scoreTrend,
    topAttemptsHighest,
    topAttemptsLowest,
    topResultsHighest,
    topResultsLowest,
  };
}
