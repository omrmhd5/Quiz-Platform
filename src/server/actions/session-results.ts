"use server";

import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import {
  attemptAnswers,
  attempts,
  questions,
  quizSessions,
  quizzes,
  students,
} from "@/db/schema";
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

async function getSessionQuestionStats(sessionId: string, quizId: string) {
  const rows = await db
    .select({
      questionId: questions.id,
      orderIndex: questions.orderIndex,
      prompt: questions.prompt,
      answeredCount: sql<number>`count(${attemptAnswers.id})::int`,
      correctCount: sql<number>`coalesce(sum(case when ${attemptAnswers.isCorrect} then 1 else 0 end), 0)::int`,
    })
    .from(questions)
    .leftJoin(attemptAnswers, eq(attemptAnswers.questionId, questions.id))
    .leftJoin(
      attempts,
      and(
        eq(attempts.id, attemptAnswers.attemptId),
        eq(attempts.sessionId, sessionId),
        eq(attempts.status, "submitted"),
      ),
    )
    .where(eq(questions.quizId, quizId))
    .groupBy(questions.id, questions.orderIndex, questions.prompt)
    .orderBy(asc(questions.orderIndex));

  return rows.map((row) => ({
    questionId: row.questionId,
    orderIndex: row.orderIndex,
    prompt: row.prompt,
    answeredCount: row.answeredCount,
    correctPercent:
      row.answeredCount > 0
        ? roundScore((row.correctCount / row.answeredCount) * 100)
        : null,
  }));
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

  const submittedScores = submittedAttempts.map((row) => row.scorePercent);
  const highestScore =
    submittedScores.length > 0
      ? roundScore(Math.max(...submittedScores))
      : null;
  const lowestScore =
    submittedScores.length > 0
      ? roundScore(Math.min(...submittedScores))
      : null;

  const [registeredRow] = await db
    .select({ registeredCount: count(students.id) })
    .from(students);

  const questionStats = await getSessionQuestionStats(
    sessionId,
    session.quiz.id,
  );

  return {
    sessionId: session.id,
    quizId: session.quiz.id,
    quizTitle: session.quiz.title,
    status: session.status,
    launchedAt: session.launchedAt,
    closedAt: session.closedAt,
    registeredCount: registeredRow?.registeredCount ?? 0,
    joinedCount,
    submittedCount,
    inProgressCount,
    averageScore,
    highestScore,
    lowestScore,
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
