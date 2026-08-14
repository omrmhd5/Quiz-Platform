"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { attempts, quizSessions, quizzes, students } from "@/db/schema";
import { requireTeacherSession } from "@/lib/auth";
import type { ActiveSessionInfo } from "@/lib/sessions";
import { validateStudentId } from "@/lib/students";
import type { JoinActionState } from "@/lib/sessions";

export async function getActiveSession(): Promise<ActiveSessionInfo | null> {
  const [row] = await db
    .select({
      sessionId: quizSessions.id,
      quizId: quizSessions.quizId,
      quizTitle: quizzes.title,
      launchedAt: quizSessions.launchedAt,
    })
    .from(quizSessions)
    .innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
    .where(eq(quizSessions.status, "active"))
    .limit(1);

  if (!row) {
    return null;
  }

  return row;
}

async function assertQuizOwnership(quizId: string, teacherId: string) {
  const quiz = await db.query.quizzes.findFirst({
    where: and(eq(quizzes.id, quizId), eq(quizzes.teacherId, teacherId)),
    columns: { id: true, title: true, questionCount: true },
  });

  if (!quiz) {
    notFound();
  }

  if (quiz.questionCount < 1) {
    throw new Error("Add at least one question before launching.");
  }

  return quiz;
}

async function closeActiveSessions() {
  await db
    .update(quizSessions)
    .set({
      status: "closed",
      closedAt: new Date(),
    })
    .where(eq(quizSessions.status, "active"));
}

export async function launchQuizSession(quizId: string, replaceActive = false) {
  const teacherSession = await requireTeacherSession();
  await assertQuizOwnership(quizId, teacherSession.teacherId);

  const active = await getActiveSession();

  if (active) {
    if (active.quizId === quizId) {
      return { sessionId: active.sessionId, quizTitle: active.quizTitle };
    }

    if (!replaceActive) {
      return {
        error: `Another quiz is already live: "${active.quizTitle}". Close it or confirm to replace it.`,
        activeSession: active,
      };
    }

    await closeActiveSessions();
  }

  const [session] = await db
    .insert(quizSessions)
    .values({
      quizId,
      status: "active",
      launchedAt: new Date(),
    })
    .returning({ id: quizSessions.id });

  revalidatePath(`/teacher/quizzes/${quizId}`);
  revalidatePath("/teacher/quizzes");
  revalidatePath("/join");

  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.id, quizId),
    columns: { title: true },
  });

  return {
    sessionId: session.id,
    quizTitle: quiz?.title ?? "Quiz",
  };
}

export async function closeQuizSession(sessionId: string) {
  const teacherSession = await requireTeacherSession();

  const session = await db.query.quizSessions.findFirst({
    where: eq(quizSessions.id, sessionId),
    with: {
      quiz: {
        columns: { teacherId: true, id: true },
      },
    },
  });

  if (!session || session.quiz.teacherId !== teacherSession.teacherId) {
    notFound();
  }

  if (session.status !== "active") {
    return { error: "This session is not active." };
  }

  await db
    .update(quizSessions)
    .set({
      status: "closed",
      closedAt: new Date(),
    })
    .where(eq(quizSessions.id, sessionId));

  revalidatePath(`/teacher/quizzes/${session.quiz.id}`);
  revalidatePath("/teacher/quizzes");
  revalidatePath("/join");

  return { success: "Quiz session closed." };
}

export async function joinByStudentId(
  _prevState: JoinActionState,
  formData: FormData,
): Promise<JoinActionState> {
  const studentId = String(formData.get("studentId") ?? "").trim();
  const idError = validateStudentId(studentId);

  if (idError) {
    return { error: idError };
  }

  const [student] = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);

  if (!student) {
    return { error: "Student ID not registered. Ask your teacher to add you." };
  }

  const activeSession = await getActiveSession();

  if (!activeSession) {
    return { error: "No quiz is running right now." };
  }

  const [existingAttempt] = await db
    .select({
      id: attempts.id,
      status: attempts.status,
    })
    .from(attempts)
    .where(
      and(
        eq(attempts.sessionId, activeSession.sessionId),
        eq(attempts.studentId, studentId),
      ),
    )
    .limit(1);

  if (existingAttempt?.status === "submitted") {
    redirect(`/quiz/${existingAttempt.id}`);
  }

  if (existingAttempt?.status === "in_progress") {
    redirect(`/quiz/${existingAttempt.id}`);
  }

  const [attempt] = await db
    .insert(attempts)
    .values({
      sessionId: activeSession.sessionId,
      studentId,
      status: "in_progress",
    })
    .returning({ id: attempts.id });

  revalidatePath("/teacher/quizzes");
  revalidatePath(`/teacher/quizzes/${activeSession.quizId}`);

  redirect(`/quiz/${attempt.id}`);
}

export async function getAttemptById(attemptId: string) {
  const attempt = await db.query.attempts.findFirst({
    where: eq(attempts.id, attemptId),
    with: {
      student: true,
      session: {
        with: {
          quiz: true,
        },
      },
    },
  });

  if (!attempt) {
    notFound();
  }

  return attempt;
}

export async function getActiveSessionAttemptCount(sessionId: string) {
  const rows = await db
    .select({ id: attempts.id })
    .from(attempts)
    .where(eq(attempts.sessionId, sessionId));

  return rows.length;
}
