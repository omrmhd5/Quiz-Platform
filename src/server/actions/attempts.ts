"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import {
  attemptAnswers,
  attemptOptionOrder,
  attemptQuestionOrder,
  attempts,
  questionOptions,
  questions,
  quizSessions,
} from "@/db/schema";
import type {
  AttemptQuizView,
  AttemptResultsView,
  SubmitAttemptState,
} from "@/lib/attempts";
import { shuffleArray } from "@/lib/shuffle";
import { applyAttemptSubmitted } from "@/server/stats/rollup";
import { tServer } from "@/lib/i18n/server";

async function getAttemptContext(attemptId: string) {
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

async function ensureAttemptOrder(attemptId: string, quizId: string) {
  const [existingOrder] = await db
    .select({ id: attemptQuestionOrder.id })
    .from(attemptQuestionOrder)
    .where(eq(attemptQuestionOrder.attemptId, attemptId))
    .limit(1);

  if (existingOrder) {
    return;
  }

  const quizQuestions = await db.query.questions.findMany({
    where: eq(questions.quizId, quizId),
    orderBy: [asc(questions.orderIndex)],
    with: {
      options: {
        orderBy: [asc(questionOptions.orderIndex)],
      },
    },
  });

  const shuffledQuestions = shuffleArray(quizQuestions);

  await db.insert(attemptQuestionOrder).values(
    shuffledQuestions.map((question, index) => ({
      attemptId,
      questionId: question.id,
      displayOrder: index,
    })),
  );

  const optionRows = shuffledQuestions.flatMap((question) =>
    shuffleArray(question.options).map((option, index) => ({
      attemptId,
      questionId: question.id,
      optionId: option.id,
      displayOrder: index,
    })),
  );

  if (optionRows.length > 0) {
    await db.insert(attemptOptionOrder).values(optionRows);
  }
}

export async function getAttemptResults(
  attemptId: string,
): Promise<AttemptResultsView> {
  const attempt = await getAttemptContext(attemptId);

  if (attempt.status !== "submitted") {
    notFound();
  }

  return {
    attemptId: attempt.id,
    quizTitle: attempt.session.quiz.title,
    studentName: attempt.student.name,
    correctCount: attempt.correctCount,
    wrongCount: attempt.wrongCount,
    unansweredCount: attempt.unansweredCount,
    scorePercent: attempt.scorePercent,
  };
}

export async function getAttemptQuizView(
  attemptId: string,
): Promise<AttemptQuizView> {
  const attempt = await getAttemptContext(attemptId);

  if (attempt.status !== "in_progress") {
    notFound();
  }

  const quizId = attempt.session.quiz.id;
  await ensureAttemptOrder(attemptId, quizId);

  const questionOrderRows = await db
    .select({
      questionId: attemptQuestionOrder.questionId,
      displayOrder: attemptQuestionOrder.displayOrder,
      prompt: questions.prompt,
    })
    .from(attemptQuestionOrder)
    .innerJoin(questions, eq(attemptQuestionOrder.questionId, questions.id))
    .where(eq(attemptQuestionOrder.attemptId, attemptId))
    .orderBy(asc(attemptQuestionOrder.displayOrder));

  const optionOrderRows = await db
    .select({
      questionId: attemptOptionOrder.questionId,
      optionId: attemptOptionOrder.optionId,
      displayOrder: attemptOptionOrder.displayOrder,
      text: questionOptions.text,
    })
    .from(attemptOptionOrder)
    .innerJoin(
      questionOptions,
      eq(attemptOptionOrder.optionId, questionOptions.id),
    )
    .where(eq(attemptOptionOrder.attemptId, attemptId))
    .orderBy(asc(attemptOptionOrder.displayOrder));

  const optionsByQuestion = new Map<
    string,
    AttemptQuizView["questions"][0]["options"]
  >();

  for (const row of optionOrderRows) {
    const letter = String.fromCharCode(65 + row.displayOrder);
    const current = optionsByQuestion.get(row.questionId) ?? [];
    current.push({
      id: row.optionId,
      text: row.text,
      letter,
    });
    optionsByQuestion.set(row.questionId, current);
  }

  return {
    attemptId: attempt.id,
    quizTitle: attempt.session.quiz.title,
    studentName: attempt.student.name,
    totalQuestions: questionOrderRows.length,
    questions: questionOrderRows.map((row, index) => ({
      id: row.questionId,
      prompt: row.prompt,
      number: index + 1,
      options: optionsByQuestion.get(row.questionId) ?? [],
    })),
  };
}

export async function submitAttempt(
  _prevState: SubmitAttemptState,
  formData: FormData,
): Promise<SubmitAttemptState> {
  const attemptId = String(formData.get("attemptId") ?? "").trim();

  if (!attemptId) {
    return { error: await tServer("errors.missingAttempt") };
  }

  const attempt = await getAttemptContext(attemptId);

  if (attempt.status === "submitted") {
    return { error: await tServer("errors.alreadySubmitted") };
  }

  if (attempt.status !== "in_progress") {
    return { error: await tServer("errors.attemptNotActive") };
  }

  const session = await db.query.quizSessions.findFirst({
    where: eq(quizSessions.id, attempt.sessionId),
    columns: { status: true },
  });

  if (!session) {
    notFound();
  }

  await ensureAttemptOrder(attemptId, attempt.session.quiz.id);

  const quizQuestions = await db.query.questions.findMany({
    where: eq(questions.quizId, attempt.session.quiz.id),
    with: {
      options: true,
    },
  });

  const answerRows: {
    attemptId: string;
    questionId: string;
    selectedOptionId: string | null;
    isCorrect: boolean;
  }[] = [];

  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  for (const question of quizQuestions) {
    const rawSelection = formData.get(`answer-${question.id}`);
    const selectedOptionId =
      typeof rawSelection === "string" && rawSelection.length > 0
        ? rawSelection
        : null;

    if (!selectedOptionId) {
      unansweredCount += 1;
      answerRows.push({
        attemptId,
        questionId: question.id,
        selectedOptionId: null,
        isCorrect: false,
      });
      continue;
    }

    const selectedOption = question.options.find(
      (option) => option.id === selectedOptionId,
    );

    if (!selectedOption || selectedOption.questionId !== question.id) {
      return { error: await tServer("errors.invalidAnswer") };
    }

    if (selectedOption.isCorrect) {
      correctCount += 1;
    } else {
      wrongCount += 1;
    }

    answerRows.push({
      attemptId,
      questionId: question.id,
      selectedOptionId,
      isCorrect: selectedOption.isCorrect,
    });
  }

  const totalQuestions = quizQuestions.length;
  const scorePercent =
    totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 1000) / 10
      : 0;

  await db.transaction(async (tx) => {
    await tx
      .delete(attemptAnswers)
      .where(eq(attemptAnswers.attemptId, attemptId));

    if (answerRows.length > 0) {
      await tx.insert(attemptAnswers).values(answerRows);
    }

    await tx
      .update(attempts)
      .set({
        status: "submitted",
        correctCount,
        wrongCount,
        unansweredCount,
        scorePercent,
        submittedAt: new Date(),
      })
      .where(eq(attempts.id, attemptId));

    await applyAttemptSubmitted(tx, {
      sessionId: attempt.session.id,
      studentId: attempt.studentId,
      teacherId: attempt.session.quiz.teacherId,
      sessionStatus: attempt.session.status,
      scorePercent,
      correctCount,
      wrongCount,
      unansweredCount,
      answers: answerRows.map((row) => ({
        questionId: row.questionId,
        selectedOptionId: row.selectedOptionId,
        isCorrect: row.isCorrect,
      })),
    });
  });

  revalidatePath(`/quiz/${attemptId}`);
  revalidatePath(`/teacher/quizzes/${attempt.session.quiz.id}`);
  revalidatePath("/teacher/dashboard");

  redirect(`/quiz/${attemptId}`);
}

export async function getAttemptPageState(attemptId: string) {
  const attempt = await getAttemptContext(attemptId);

  return {
    attemptId: attempt.id,
    status: attempt.status,
    sessionStatus: attempt.session.status,
    quizTitle: attempt.session.quiz.title,
    studentName: attempt.student.name,
    correctCount: attempt.correctCount,
    wrongCount: attempt.wrongCount,
    unansweredCount: attempt.unansweredCount,
    scorePercent: attempt.scorePercent,
  };
}
