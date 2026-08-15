"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { attempts, quizSessions, quizzes, students } from "@/db/schema";
import { requireTeacherSession } from "@/lib/auth";
import type { StudentHistoryView } from "@/lib/student-history";

function roundScore(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  return Math.round(value * 10) / 10;
}

export async function getStudentHistory(
  studentId: string,
): Promise<StudentHistoryView> {
  const teacherSession = await requireTeacherSession();

  const student = await db.query.students.findFirst({
    where: eq(students.id, studentId),
  });

  if (!student) {
    notFound();
  }

  const attemptRows = await db
    .select({
      attemptId: attempts.id,
      sessionId: quizSessions.id,
      quizId: quizzes.id,
      quizTitle: quizzes.title,
      sessionStatus: quizSessions.status,
      launchedAt: quizSessions.launchedAt,
      status: attempts.status,
      scorePercent: attempts.scorePercent,
      correctCount: attempts.correctCount,
      wrongCount: attempts.wrongCount,
      unansweredCount: attempts.unansweredCount,
      submittedAt: attempts.submittedAt,
    })
    .from(attempts)
    .innerJoin(quizSessions, eq(attempts.sessionId, quizSessions.id))
    .innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
    .where(
      and(
        eq(attempts.studentId, studentId),
        eq(quizzes.teacherId, teacherSession.teacherId),
      ),
    )
    .orderBy(desc(quizSessions.launchedAt));

  const submittedAttempts = attemptRows.filter(
    (row) => row.status === "submitted",
  );

  return {
    studentId: student.id,
    studentName: student.name,
    registeredAt: student.createdAt,
    attemptCount: attemptRows.length,
    submittedCount: submittedAttempts.length,
    averageScore:
      submittedAttempts.length > 0
        ? roundScore(
            submittedAttempts.reduce((sum, row) => sum + row.scorePercent, 0) /
              submittedAttempts.length,
          )
        : null,
    attempts: attemptRows.map((row) => ({
      attemptId: row.attemptId,
      sessionId: row.sessionId,
      quizId: row.quizId,
      quizTitle: row.quizTitle,
      sessionStatus: row.sessionStatus,
      launchedAt: row.launchedAt,
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
