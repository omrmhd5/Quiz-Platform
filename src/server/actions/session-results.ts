"use server";

import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import {
  attempts,
  questions,
  quizSessions,
  quizzes,
  sessionQuestionStats,
  sessionStats,
  students,
} from "@/db/schema";
import { requireTeacherSession } from "@/lib/auth";
import type {
  SessionResultsView,
  SessionSummaryView,
} from "@/lib/session-results";
import { roundScore } from "@/lib/scores";
import { mapQuestionCorrectPercent } from "@/server/stats/rollup";

async function assertSessionOwnership(sessionId: string, teacherId: string) {
  const session = await db.query.quizSessions.findFirst({
    where: eq(quizSessions.id, sessionId),
    with: {
      quiz: {
        columns: { id: true, title: true, teacherId: true },
      },
    },
  });

  if (!session || session.quiz.teacherId !== teacherId) {
    notFound();
  }

  return session;
}

function mapSessionSummary(row: {
  sessionId: string;
  quizId: string;
  quizTitle: string;
  status: SessionSummaryView["status"];
  launchedAt: Date | null;
  closedAt: Date | null;
  joinedCount: number;
  submittedCount: number;
  inProgressCount: number;
  averageScore: number | null;
  highestScore: number | null;
  lowestScore: number | null;
}): SessionSummaryView {
  return {
    sessionId: row.sessionId,
    quizId: row.quizId,
    quizTitle: row.quizTitle,
    status: row.status,
    launchedAt: row.launchedAt,
    closedAt: row.closedAt,
    joinedCount: row.joinedCount,
    submittedCount: row.submittedCount,
    inProgressCount: row.inProgressCount,
    averageScore: roundScore(row.averageScore),
    highestScore: roundScore(row.highestScore),
    lowestScore: roundScore(row.lowestScore),
  };
}

async function getSessionQuestionStatsFromRollups(
  sessionId: string,
  quizId: string,
) {
  const rows = await db
    .select({
      questionId: questions.id,
      orderIndex: questions.orderIndex,
      prompt: questions.prompt,
      answeredCount: sessionQuestionStats.answeredCount,
      correctCount: sessionQuestionStats.correctCount,
    })
    .from(questions)
    .leftJoin(
      sessionQuestionStats,
      and(
        eq(sessionQuestionStats.questionId, questions.id),
        eq(sessionQuestionStats.sessionId, sessionId),
      ),
    )
    .where(eq(questions.quizId, quizId))
    .orderBy(asc(questions.orderIndex));

  return rows.map((row) => ({
    questionId: row.questionId,
    orderIndex: row.orderIndex,
    prompt: row.prompt,
    answeredCount: row.answeredCount ?? 0,
    correctPercent: mapQuestionCorrectPercent(
      row.answeredCount ?? 0,
      row.correctCount ?? 0,
    ),
  }));
}

export async function getQuizSessionSummaries(
  quizId: string,
): Promise<SessionSummaryView[]> {
  const teacherSession = await requireTeacherSession();

  const quiz = await db.query.quizzes.findFirst({
    where: and(
      eq(quizzes.id, quizId),
      eq(quizzes.teacherId, teacherSession.teacherId),
    ),
    columns: { id: true, title: true },
  });

  if (!quiz) {
    notFound();
  }

  const rows = await db
    .select({
      sessionId: quizSessions.id,
      quizId: quizzes.id,
      quizTitle: quizzes.title,
      status: quizSessions.status,
      launchedAt: quizSessions.launchedAt,
      closedAt: quizSessions.closedAt,
      joinedCount: sql<number>`coalesce(${sessionStats.joinedCount}, 0)::int`,
      submittedCount: sql<number>`coalesce(${sessionStats.submittedCount}, 0)::int`,
      inProgressCount: sql<number>`coalesce(${sessionStats.inProgressCount}, 0)::int`,
      averageScore: sessionStats.averageScore,
      highestScore: sessionStats.highestScore,
      lowestScore: sessionStats.lowestScore,
    })
    .from(quizSessions)
    .innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
    .leftJoin(sessionStats, eq(sessionStats.sessionId, quizSessions.id))
    .where(eq(quizSessions.quizId, quizId))
    .orderBy(desc(quizSessions.launchedAt));

  return rows.map(mapSessionSummary);
}

export async function getSessionResults(
  sessionId: string,
): Promise<SessionResultsView> {
  const teacherSession = await requireTeacherSession();
  const session = await assertSessionOwnership(
    sessionId,
    teacherSession.teacherId,
  );

  const [statsRow] = await db
    .select({
      joinedCount: sql<number>`coalesce(${sessionStats.joinedCount}, 0)::int`,
      submittedCount: sql<number>`coalesce(${sessionStats.submittedCount}, 0)::int`,
      inProgressCount: sql<number>`coalesce(${sessionStats.inProgressCount}, 0)::int`,
      averageScore: sessionStats.averageScore,
      highestScore: sessionStats.highestScore,
      lowestScore: sessionStats.lowestScore,
      totalCorrect: sql<number>`coalesce(${sessionStats.totalCorrect}, 0)::int`,
      totalWrong: sql<number>`coalesce(${sessionStats.totalWrong}, 0)::int`,
      totalSkipped: sql<number>`coalesce(${sessionStats.totalSkipped}, 0)::int`,
    })
    .from(sessionStats)
    .where(eq(sessionStats.sessionId, sessionId))
    .limit(1);

  const attemptRows = await db
    .select({
      attemptId: attempts.id,
      studentId: students.id,
      studentName: students.name,
      status: attempts.status,
      scorePercent: attempts.scorePercent,
      correctCount: attempts.correctCount,
      wrongCount: attempts.wrongCount,
      unansweredCount: attempts.unansweredCount,
      submittedAt: attempts.submittedAt,
    })
    .from(attempts)
    .innerJoin(students, eq(attempts.studentId, students.id))
    .where(eq(attempts.sessionId, sessionId))
    .orderBy(
      sql`case when ${attempts.status} = 'submitted' then 0 else 1 end`,
      desc(attempts.scorePercent),
      students.name,
    );

  const [registeredRow] = await db
    .select({ registeredCount: count(students.id) })
    .from(students);

  const questionStats = await getSessionQuestionStatsFromRollups(
    sessionId,
    session.quiz.id,
  );

  const summary = mapSessionSummary({
    sessionId: session.id,
    quizId: session.quiz.id,
    quizTitle: session.quiz.title,
    status: session.status,
    launchedAt: session.launchedAt,
    closedAt: session.closedAt,
    joinedCount: statsRow?.joinedCount ?? attemptRows.length,
    submittedCount: statsRow?.submittedCount ?? 0,
    inProgressCount:
      statsRow?.inProgressCount ??
      attemptRows.filter((row) => row.status === "in_progress").length,
    averageScore: statsRow?.averageScore ?? null,
    highestScore: statsRow?.highestScore ?? null,
    lowestScore: statsRow?.lowestScore ?? null,
  });

  return {
    ...summary,
    registeredCount: registeredRow?.registeredCount ?? 0,
    totalCorrect: statsRow?.totalCorrect ?? 0,
    totalWrong: statsRow?.totalWrong ?? 0,
    totalSkipped: statsRow?.totalSkipped ?? 0,
    questionStats,
    attempts: attemptRows.map((row) => ({
      attemptId: row.attemptId,
      studentId: row.studentId,
      studentName: row.studentName,
      status: row.status,
      scorePercent:
        row.status === "submitted" ? roundScore(row.scorePercent) : null,
      correctCount: row.status === "submitted" ? row.correctCount : null,
      wrongCount: row.status === "submitted" ? row.wrongCount : null,
      unansweredCount: row.status === "submitted" ? row.unansweredCount : null,
      submittedAt: row.submittedAt,
    })),
  };
}

export async function getQuizSessionsResults(
  quizId: string,
): Promise<SessionResultsView[]> {
  const summaries = await getQuizSessionSummaries(quizId);
  return Promise.all(
    summaries.map((summary) => getSessionResults(summary.sessionId)),
  );
}

export async function getSessionResultsSnapshot(sessionId: string) {
  return getSessionResults(sessionId);
}
