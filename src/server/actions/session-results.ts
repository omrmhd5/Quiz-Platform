"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { attempts, quizSessions, quizzes, students } from "@/db/schema";
import { requireTeacherSession } from "@/lib/auth";
import type { SessionResultsView } from "@/lib/session-results";

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

function roundScore(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  return Math.round(value * 10) / 10;
}

export async function getSessionResults(
  sessionId: string,
): Promise<SessionResultsView> {
  const teacherSession = await requireTeacherSession();
  const session = await assertSessionOwnership(
    sessionId,
    teacherSession.teacherId,
  );

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

  const joinedCount = attemptRows.length;
  const submittedAttempts = attemptRows.filter(
    (row) => row.status === "submitted",
  );
  const submittedCount = submittedAttempts.length;
  const inProgressCount = joinedCount - submittedCount;
  const averageScore =
    submittedCount > 0
      ? roundScore(
          submittedAttempts.reduce((sum, row) => sum + row.scorePercent, 0) /
            submittedCount,
        )
      : null;

  return {
    sessionId: session.id,
    quizId: session.quiz.id,
    quizTitle: session.quiz.title,
    status: session.status,
    launchedAt: session.launchedAt,
    closedAt: session.closedAt,
    joinedCount,
    submittedCount,
    inProgressCount,
    averageScore,
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
  const teacherSession = await requireTeacherSession();

  const quiz = await db.query.quizzes.findFirst({
    where: and(
      eq(quizzes.id, quizId),
      eq(quizzes.teacherId, teacherSession.teacherId),
    ),
    columns: { id: true },
  });

  if (!quiz) {
    notFound();
  }

  const sessions = await db.query.quizSessions.findMany({
    where: eq(quizSessions.quizId, quizId),
    orderBy: [desc(quizSessions.launchedAt)],
    columns: { id: true },
  });

  return Promise.all(sessions.map((session) => getSessionResults(session.id)));
}

export async function getSessionResultsSnapshot(sessionId: string) {
  return getSessionResults(sessionId);
}
