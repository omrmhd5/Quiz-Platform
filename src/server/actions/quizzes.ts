"use server";

import { and, countDistinct, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { questionOptions, questions, quizSessions, quizzes } from "@/db/schema";
import { requireTeacherSession } from "@/lib/auth";
import {
  validateQuizQuestions,
  validateQuizTitle,
  type QuizActionState,
  type QuizQuestionPayload,
} from "@/lib/quizzes";

async function getOwnedQuiz(quizId: string, teacherId: string) {
  const quiz = await db.query.quizzes.findFirst({
    where: and(eq(quizzes.id, quizId), eq(quizzes.teacherId, teacherId)),
    with: {
      sessions: true,
    },
  });

  if (!quiz) {
    notFound();
  }

  return quiz;
}

function parseSavePayload(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const questionsRaw = String(formData.get("questions") ?? "[]");

  const titleError = validateQuizTitle(title);
  if (titleError) {
    return { error: titleError };
  }

  let parsedQuestions: QuizQuestionPayload[] = [];

  try {
    const parsed = JSON.parse(questionsRaw);

    if (!Array.isArray(parsed)) {
      return { error: "Invalid quiz data." as const };
    }

    parsedQuestions = parsed;
  } catch {
    return { error: "Invalid quiz data." as const };
  }

  const questionsError = validateQuizQuestions(parsedQuestions);
  if (questionsError) {
    return { error: questionsError };
  }

  return {
    title,
    questions: parsedQuestions,
  };
}

async function persistQuizQuestions(
  quizId: string,
  items: QuizQuestionPayload[],
) {
  await db.delete(questions).where(eq(questions.quizId, quizId));

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];

    const [question] = await db
      .insert(questions)
      .values({
        quizId,
        orderIndex: index,
        prompt: item.prompt,
      })
      .returning({ id: questions.id });

    await db.insert(questionOptions).values(
      item.options.map((option, optionIndex) => ({
        questionId: question.id,
        orderIndex: optionIndex,
        text: option.text,
        isCorrect: option.isCorrect,
      })),
    );
  }

  await db
    .update(quizzes)
    .set({
      questionCount: items.length,
      status: "saved",
    })
    .where(eq(quizzes.id, quizId));
}

export async function getQuizzes() {
  const session = await requireTeacherSession();

  return db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      status: quizzes.status,
      questionCount: quizzes.questionCount,
      createdAt: quizzes.createdAt,
      sessionCount: countDistinct(quizSessions.id),
    })
    .from(quizzes)
    .leftJoin(quizSessions, eq(quizSessions.quizId, quizzes.id))
    .where(eq(quizzes.teacherId, session.teacherId))
    .groupBy(
      quizzes.id,
      quizzes.title,
      quizzes.status,
      quizzes.questionCount,
      quizzes.createdAt,
    )
    .orderBy(desc(quizzes.createdAt));
}

export async function getQuizById(quizId: string) {
  const session = await requireTeacherSession();

  const quiz = await db.query.quizzes.findFirst({
    where: and(
      eq(quizzes.id, quizId),
      eq(quizzes.teacherId, session.teacherId),
    ),
    with: {
      questions: {
        orderBy: (questionsTable, { asc }) => [asc(questionsTable.orderIndex)],
        with: {
          options: {
            orderBy: (optionsTable, { asc }) => [asc(optionsTable.orderIndex)],
          },
        },
      },
      sessions: {
        orderBy: (sessionsTable, { desc }) => [desc(sessionsTable.launchedAt)],
      },
    },
  });

  if (!quiz) {
    notFound();
  }

  return quiz;
}

export async function createQuiz(
  _prevState: QuizActionState,
  formData: FormData,
): Promise<QuizActionState> {
  const session = await requireTeacherSession();
  const payload = parseSavePayload(formData);

  if ("error" in payload) {
    return { error: payload.error };
  }

  const [quiz] = await db
    .insert(quizzes)
    .values({
      teacherId: session.teacherId,
      title: payload.title,
      status: "saved",
      questionCount: payload.questions.length,
    })
    .returning({ id: quizzes.id });

  await persistQuizQuestions(quiz.id, payload.questions);

  revalidatePath("/teacher/quizzes");
  redirect(`/teacher/quizzes/${quiz.id}`);
}

export async function updateQuiz(
  quizId: string,
  _prevState: QuizActionState,
  formData: FormData,
): Promise<QuizActionState> {
  const session = await requireTeacherSession();
  const quiz = await getOwnedQuiz(quizId, session.teacherId);
  const hadSessions = quiz.sessions.length > 0;

  if (hadSessions) {
    const confirmed = formData.get("confirmWipeHistory") === "1";

    if (!confirmed) {
      return {
        error:
          "Confirm that you want to erase all session history before saving.",
      };
    }

    await db.delete(quizSessions).where(eq(quizSessions.quizId, quizId));
  }

  const payload = parseSavePayload(formData);

  if ("error" in payload) {
    return { error: payload.error };
  }

  await db
    .update(quizzes)
    .set({ title: payload.title })
    .where(eq(quizzes.id, quizId));

  await persistQuizQuestions(quizId, payload.questions);

  revalidatePath("/teacher/quizzes");
  revalidatePath(`/teacher/quizzes/${quizId}`);
  if (hadSessions) {
    revalidatePath("/join");
    revalidatePath("/teacher/dashboard");
  }
  redirect(`/teacher/quizzes/${quizId}`);
}

export async function deleteQuiz(quizId: string) {
  const session = await requireTeacherSession();
  await getOwnedQuiz(quizId, session.teacherId);

  await db.delete(quizzes).where(eq(quizzes.id, quizId));

  revalidatePath("/teacher/quizzes");
  revalidatePath(`/teacher/quizzes/${quizId}`);
  revalidatePath("/join");
  revalidatePath("/teacher/dashboard");
  redirect("/teacher/quizzes");
}
