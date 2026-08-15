"use server";

import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { attempts, quizSessions, quizzes, students } from "@/db/schema";
import { requireTeacherSession } from "@/lib/auth";
import {
  DASHBOARD_RECENT_SESSIONS,
  DASHBOARD_TREND_SESSIONS,
  type DashboardAttemptRow,
  type DashboardView,
} from "@/lib/dashboard";

function roundScore(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  return Math.round(value * 10) / 10;
}

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

export async function getDashboardStats(): Promise<DashboardView> {
  const teacherSession = await requireTeacherSession();
  const teacherId = teacherSession.teacherId;

  const [studentRow] = await db
    .select({ studentCount: count(students.id) })
    .from(students);

  const [quizRow] = await db
    .select({ quizCount: count(quizzes.id) })
    .from(quizzes)
    .where(eq(quizzes.teacherId, teacherId));

  const [sessionRow] = await db
    .select({ sessionCount: count(quizSessions.id) })
    .from(quizSessions)
    .innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
    .where(eq(quizzes.teacherId, teacherId));

  const [attemptRow] = await db
    .select({
      totalAttempts: count(attempts.id),
      submittedCount: sql<number>`count(*) filter (where ${attempts.status} = 'submitted')::int`,
      liveInProgressCount: sql<number>`count(*) filter (where ${attempts.status} = 'in_progress' and ${quizSessions.status} = 'active')::int`,
      didntFinishCount: sql<number>`count(*) filter (where ${attempts.status} = 'in_progress' and ${quizSessions.status} = 'closed')::int`,
      overallAverageScore: sql<
        number | null
      >`avg(${attempts.scorePercent}) filter (where ${attempts.status} = 'submitted')`,
      totalCorrect: sql<number>`coalesce(sum(${attempts.correctCount}) filter (where ${attempts.status} = 'submitted'), 0)::int`,
      totalWrong: sql<number>`coalesce(sum(${attempts.wrongCount}) filter (where ${attempts.status} = 'submitted'), 0)::int`,
      totalSkipped: sql<number>`coalesce(sum(${attempts.unansweredCount}) filter (where ${attempts.status} = 'submitted'), 0)::int`,
    })
    .from(attempts)
    .innerJoin(quizSessions, eq(attempts.sessionId, quizSessions.id))
    .innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
    .where(eq(quizzes.teacherId, teacherId));

  const totalCorrect = attemptRow?.totalCorrect ?? 0;
  const totalWrong = attemptRow?.totalWrong ?? 0;
  const totalSkipped = attemptRow?.totalSkipped ?? 0;

  const sessionRows = await db
    .select({
      sessionId: quizSessions.id,
      quizId: quizzes.id,
      quizTitle: quizzes.title,
      status: quizSessions.status,
      launchedAt: quizSessions.launchedAt,
      joinedCount: count(attempts.id),
      submittedCount: sql<number>`count(*) filter (where ${attempts.status} = 'submitted')::int`,
      averageScore: sql<
        number | null
      >`avg(${attempts.scorePercent}) filter (where ${attempts.status} = 'submitted')`,
      highestScore: sql<
        number | null
      >`max(${attempts.scorePercent}) filter (where ${attempts.status} = 'submitted')`,
      lowestScore: sql<
        number | null
      >`min(${attempts.scorePercent}) filter (where ${attempts.status} = 'submitted')`,
    })
    .from(quizSessions)
    .innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
    .leftJoin(attempts, eq(attempts.sessionId, quizSessions.id))
    .where(eq(quizzes.teacherId, teacherId))
    .groupBy(
      quizSessions.id,
      quizzes.id,
      quizzes.title,
      quizSessions.status,
      quizSessions.launchedAt,
    )
    .orderBy(desc(quizSessions.launchedAt));

  const trendSessionRows = sessionRows.slice(0, DASHBOARD_TREND_SESSIONS);

  const submittedAttemptRows = await db
    .select({
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
    })
    .from(attempts)
    .innerJoin(students, eq(attempts.studentId, students.id))
    .innerJoin(quizSessions, eq(attempts.sessionId, quizSessions.id))
    .innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
    .where(
      and(eq(quizzes.teacherId, teacherId), eq(attempts.status, "submitted")),
    )
    .orderBy(desc(attempts.submittedAt));

  const mappedSessions = sessionRows.map((row) => ({
    sessionId: row.sessionId,
    quizId: row.quizId,
    quizTitle: row.quizTitle,
    status: row.status,
    launchedAt: row.launchedAt,
    joinedCount: Number(row.joinedCount),
    submittedCount: row.submittedCount,
    averageScore: roundScore(row.averageScore),
    highestScore: roundScore(row.highestScore),
    lowestScore: roundScore(row.lowestScore),
  }));

  const mappedTrendSessions = trendSessionRows.map((row) => ({
    sessionId: row.sessionId,
    quizId: row.quizId,
    quizTitle: row.quizTitle,
    status: row.status,
    launchedAt: row.launchedAt,
    joinedCount: Number(row.joinedCount),
    submittedCount: row.submittedCount,
    averageScore: roundScore(row.averageScore),
    highestScore: roundScore(row.highestScore),
    lowestScore: roundScore(row.lowestScore),
  }));

  return {
    studentCount: studentRow?.studentCount ?? 0,
    quizCount: quizRow?.quizCount ?? 0,
    sessionCount: sessionRow?.sessionCount ?? 0,
    totalAttempts: Number(attemptRow?.totalAttempts ?? 0),
    submittedCount: attemptRow?.submittedCount ?? 0,
    liveInProgressCount: attemptRow?.liveInProgressCount ?? 0,
    didntFinishCount: attemptRow?.didntFinishCount ?? 0,
    overallAverageScore: roundScore(attemptRow?.overallAverageScore),
    totalCorrect,
    totalWrong,
    totalSkipped,
    recentSessions: mappedSessions.slice(0, DASHBOARD_RECENT_SESSIONS),
    scoreTrend: [...mappedTrendSessions].reverse().map((row) => ({
      sessionId: row.sessionId,
      quizTitle: row.quizTitle,
      launchedAt: row.launchedAt,
      averageScore: row.averageScore,
      label: formatTrendLabel(row.launchedAt, row.quizTitle),
    })),
    submittedAttempts: submittedAttemptRows.map(mapAttemptRow),
    sessionResults: mappedSessions.filter((row) => row.submittedCount > 0),
  };
}
