"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import {
  attempts,
  quizSessions,
  quizzes,
  sessionStats,
  students,
} from "@/db/schema";
import { requireTeacherSession } from "@/lib/auth";
import { tMsg, tServer } from "@/lib/i18n/server";
import type { ActiveSessionInfo } from "@/lib/sessions";
import { validateStudentId } from "@/lib/students";
import type { JoinActionState } from "@/lib/sessions";
import {
  applyAttemptJoined,
  applySessionClosed,
  applySessionLaunched,
} from "@/server/stats/rollup";

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
    throw new Error(await tServer("errors.launchNeedQuestion"));
  }

  return quiz;
}

async function closeActiveSessions(teacherId: string) {
  const activeSessions = await db
    .select({
      sessionId: quizSessions.id,
    })
    .from(quizSessions)
    .where(eq(quizSessions.status, "active"));

  if (activeSessions.length === 0) {
    return;
  }

  await db.transaction(async (tx) => {
    for (const session of activeSessions) {
      await applySessionClosed(tx, session.sessionId, teacherId);
    }

    await tx
      .update(quizSessions)
      .set({
        status: "closed",
        closedAt: new Date(),
      })
      .where(eq(quizSessions.status, "active"));
  });
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
        error: await tServer("errors.anotherQuizLive", {
          title: active.quizTitle,
        }),
        activeSession: active,
      };
    }

    await closeActiveSessions(teacherSession.teacherId);
  }

  const session = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(quizSessions)
      .values({
        quizId,
        status: "active",
        launchedAt: new Date(),
      })
      .returning({ id: quizSessions.id });

    await applySessionLaunched(tx, created.id, teacherSession.teacherId);
    return created;
  });

  revalidatePath(`/teacher/quizzes/${quizId}`);
  revalidatePath("/teacher/quizzes");
  revalidatePath("/teacher/dashboard");
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
    return { error: await tServer("errors.sessionNotActive") };
  }

  await db.transaction(async (tx) => {
    await applySessionClosed(tx, sessionId, teacherSession.teacherId);
    await tx
      .update(quizSessions)
      .set({
        status: "closed",
        closedAt: new Date(),
      })
      .where(eq(quizSessions.id, sessionId));
  });

  revalidatePath(`/teacher/quizzes/${session.quiz.id}`);
  revalidatePath("/teacher/quizzes");
  revalidatePath("/teacher/dashboard");
  revalidatePath("/join");

  return { success: await tServer("success.sessionClosed") };
}

export async function joinByStudentId(
  _prevState: JoinActionState,
  formData: FormData,
): Promise<JoinActionState> {
  const studentId = String(formData.get("studentId") ?? "").trim();
  const idError = validateStudentId(studentId);

  if (idError) {
    return { error: await tMsg(idError) };
  }

  const [student] = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);

  if (!student) {
    return { error: await tServer("errors.studentNotRegistered") };
  }

  const activeSession = await getActiveSession();

  if (!activeSession) {
    return { error: await tServer("errors.noQuizRunning") };
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

  const [attempt] = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(attempts)
      .values({
        sessionId: activeSession.sessionId,
        studentId,
        status: "in_progress",
      })
      .returning({ id: attempts.id });

    const [quizRow] = await tx
      .select({ teacherId: quizzes.teacherId })
      .from(quizSessions)
      .innerJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
      .where(eq(quizSessions.id, activeSession.sessionId))
      .limit(1);

    if (quizRow) {
      await applyAttemptJoined(
        tx,
        activeSession.sessionId,
        studentId,
        quizRow.teacherId,
      );
    }

    return [created];
  });

  revalidatePath("/teacher/quizzes");
  revalidatePath(`/teacher/quizzes/${activeSession.quizId}`);
  revalidatePath("/teacher/dashboard");

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
  const [row] = await db
    .select({ joinedCount: sessionStats.joinedCount })
    .from(sessionStats)
    .where(eq(sessionStats.sessionId, sessionId))
    .limit(1);

  if (row) {
    return row.joinedCount;
  }

  const rows = await db
    .select({ id: attempts.id })
    .from(attempts)
    .where(eq(attempts.sessionId, sessionId));

  return rows.length;
}
