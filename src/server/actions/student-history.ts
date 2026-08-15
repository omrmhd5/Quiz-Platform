"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import {
  attempts,
  quizSessions,
  quizzes,
  studentStats,
  students,
} from "@/db/schema";
import { requireTeacherSession } from "@/lib/auth";
import { clampPage, getPageCount, STUDENTS_PAGE_SIZE } from "@/lib/pagination";
import type { StudentHistoryView } from "@/lib/student-history";
import { roundScore } from "@/lib/scores";

export async function getStudentHistory(
  studentId: string,
  page = 1,
): Promise<StudentHistoryView> {
  const teacherSession = await requireTeacherSession();

  const student = await db.query.students.findFirst({
    where: eq(students.id, studentId),
  });

  if (!student) {
    notFound();
  }

  const [statsRow] = await db
    .select({
      attemptCount: studentStats.attemptCount,
      submittedCount: studentStats.submittedCount,
      didntFinishCount: studentStats.didntFinishCount,
      averageScore: studentStats.averageScore,
      highestScore: studentStats.highestScore,
      lowestScore: studentStats.lowestScore,
      totalCorrect: studentStats.totalCorrect,
      totalWrong: studentStats.totalWrong,
      totalSkipped: studentStats.totalSkipped,
    })
    .from(studentStats)
    .where(eq(studentStats.studentId, studentId))
    .limit(1);

  const [{ totalAttempts }] = await db
    .select({
      totalAttempts: sql<number>`count(*)::int`,
    })
    .from(attempts)
    .innerJoin(quizSessions, eq(attempts.sessionId, quizSessions.id))
    .innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
    .where(
      and(
        eq(attempts.studentId, studentId),
        eq(quizzes.teacherId, teacherSession.teacherId),
      ),
    );

  const pageCount = getPageCount(totalAttempts, STUDENTS_PAGE_SIZE);
  const safePage = clampPage(page, pageCount);
  const offset = (safePage - 1) * STUDENTS_PAGE_SIZE;

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
    .orderBy(desc(quizSessions.launchedAt))
    .limit(STUDENTS_PAGE_SIZE)
    .offset(offset);

  return {
    studentId: student.id,
    studentName: student.name,
    registeredAt: student.createdAt,
    attemptCount: totalAttempts,
    submittedCount: statsRow?.submittedCount ?? 0,
    didntFinishCount: statsRow?.didntFinishCount ?? 0,
    averageScore: roundScore(statsRow?.averageScore),
    highestScore: roundScore(statsRow?.highestScore),
    lowestScore: roundScore(statsRow?.lowestScore),
    totalCorrect: statsRow?.totalCorrect ?? 0,
    totalWrong: statsRow?.totalWrong ?? 0,
    totalSkipped: statsRow?.totalSkipped ?? 0,
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
    page: safePage,
    pageCount,
    totalAttempts,
  };
}
