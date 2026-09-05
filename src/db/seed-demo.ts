import bcrypt from "bcryptjs";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { getDatabaseUrl } from "@/lib/db-url";
import {
  attemptAnswers,
  attemptOptionOrder,
  attemptQuestionOrder,
  attempts,
  questionOptions,
  questions,
  quizSessions,
  quizzes,
  sessionQuestionStats,
  sessionStats,
  studentStats,
  students,
  teacherStats,
  teachers,
} from "./schema";

const DEMO_TEACHER_USERNAME = "teacher";
const DEMO_TEACHER_PASSWORD = "teacher123";

async function seedDemo() {
  const neonPath = resolve(process.cwd(), ".env.neon.local");
  if (existsSync(neonPath)) {
    for (const line of readFileSync(neonPath, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const separatorIndex = trimmed.indexOf("=");
      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      if (key) process.env[key] = value;
    }
  }

  const connectionString = getDatabaseUrl();
  const needsSsl = /neon\.tech|sslmode=require|render\.com/i.test(
    connectionString,
  );
  const client = postgres(connectionString, {
    max: 1,
    ...(needsSsl ? { ssl: "require" } : {}),
  });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: resolve(process.cwd(), "drizzle") });

  await db.delete(attemptOptionOrder);
  await db.delete(attemptQuestionOrder);
  await db.delete(attemptAnswers);
  await db.delete(sessionQuestionStats);
  await db.delete(sessionStats);
  await db.delete(studentStats);
  await db.delete(teacherStats);
  await db.delete(attempts);
  await db.delete(quizSessions);
  await db.delete(questionOptions);
  await db.delete(questions);
  await db.delete(quizzes);
  await db.delete(students);
  await db.delete(teachers);

  const passwordHash = await bcrypt.hash(DEMO_TEACHER_PASSWORD, 12);
  const [teacher] = await db
    .insert(teachers)
    .values({
      username: DEMO_TEACHER_USERNAME,
      passwordHash,
    })
    .returning({ id: teachers.id });

  const studentRows = [
    { id: "s001", name: "Alex Smith" },
    { id: "s002", name: "Jordan Lee" },
    { id: "s003", name: "Sam Patel" },
    { id: "s004", name: "Maya Chen" },
    { id: "s005", name: "Omar Hassan" },
    { id: "s006", name: "Lina Farouk" },
    { id: "s007", name: "Noah Williams" },
    { id: "s008", name: "Sara Ibrahim" },
  ];
  await db.insert(students).values(studentRows);

  const [quiz] = await db
    .insert(quizzes)
    .values({
      teacherId: teacher.id,
      title: "Chapter 1 — Classroom Review",
      status: "saved",
      questionCount: 3,
    })
    .returning({ id: quizzes.id });

  const [quiz2] = await db
    .insert(quizzes)
    .values({
      teacherId: teacher.id,
      title: "Science Warm-up",
      status: "saved",
      questionCount: 2,
    })
    .returning({ id: quizzes.id });

  const q1 = await insertQuestion(db, quiz.id, 0, "What is 2 + 2?", [
    { text: "3", isCorrect: false },
    { text: "4", isCorrect: true },
    { text: "5", isCorrect: false },
    { text: "22", isCorrect: false },
  ]);
  const q2 = await insertQuestion(
    db,
    quiz.id,
    1,
    "Which planet is closest to the Sun?",
    [
      { text: "Venus", isCorrect: false },
      { text: "Mercury", isCorrect: true },
      { text: "Earth", isCorrect: false },
      { text: "Mars", isCorrect: false },
    ],
  );
  const q3 = await insertQuestion(db, quiz.id, 2, "Water freezes at…", [
    { text: "0°C", isCorrect: true },
    { text: "10°C", isCorrect: false },
    { text: "32°C", isCorrect: false },
    { text: "100°C", isCorrect: false },
  ]);

  await insertQuestion(db, quiz2.id, 0, "Plants produce oxygen by…", [
    { text: "Photosynthesis", isCorrect: true },
    { text: "Respiration", isCorrect: false },
    { text: "Evaporation", isCorrect: false },
    { text: "Fermentation", isCorrect: false },
  ]);
  await insertQuestion(db, quiz2.id, 1, "The chemical symbol for water is…", [
    { text: "O2", isCorrect: false },
    { text: "H2O", isCorrect: true },
    { text: "CO2", isCorrect: false },
    { text: "NaCl", isCorrect: false },
  ]);

  const launchedAt = new Date(Date.now() - 1000 * 60 * 60 * 24);
  const closedAt = new Date(Date.now() - 1000 * 60 * 60 * 23);

  const [session] = await db
    .insert(quizSessions)
    .values({
      quizId: quiz.id,
      status: "closed",
      launchedAt,
      closedAt,
    })
    .returning({ id: quizSessions.id });

  const submittedStudents = studentRows.slice(0, 6);
  let scoreSum = 0;
  let totalCorrect = 0;
  let totalWrong = 0;
  let totalSkipped = 0;

  for (const [index, student] of submittedStudents.entries()) {
    const correctCount = index % 3 === 0 ? 3 : index % 3 === 1 ? 2 : 1;
    const wrongCount = 3 - correctCount;
    const unansweredCount = 0;
    const scorePercent = Math.round((correctCount / 3) * 100);
    scoreSum += scorePercent;
    totalCorrect += correctCount;
    totalWrong += wrongCount;

    const [attempt] = await db
      .insert(attempts)
      .values({
        sessionId: session.id,
        studentId: student.id,
        status: "submitted",
        correctCount,
        wrongCount,
        unansweredCount,
        scorePercent,
        startedAt: launchedAt,
        submittedAt: new Date(launchedAt.getTime() + 1000 * 60 * (8 + index)),
      })
      .returning({ id: attempts.id });

    const ordered = [q1, q2, q3];
    for (const [qIndex, question] of ordered.entries()) {
      await db.insert(attemptQuestionOrder).values({
        attemptId: attempt.id,
        questionId: question.id,
        displayOrder: qIndex,
      });
      for (const [optIndex, option] of question.options.entries()) {
        await db.insert(attemptOptionOrder).values({
          attemptId: attempt.id,
          questionId: question.id,
          optionId: option.id,
          displayOrder: optIndex,
        });
      }

      const pickCorrect = qIndex < correctCount;
      const selected = pickCorrect
        ? question.options.find((option) => option.isCorrect)
        : question.options.find((option) => !option.isCorrect);

      await db.insert(attemptAnswers).values({
        attemptId: attempt.id,
        questionId: question.id,
        selectedOptionId: selected?.id ?? null,
        isCorrect: Boolean(pickCorrect),
      });
    }
  }

  const submittedCount = submittedStudents.length;
  const scores = submittedStudents.map((_, index) =>
    Math.round(((index % 3 === 0 ? 3 : index % 3 === 1 ? 2 : 1) / 3) * 100),
  );

  await db.insert(sessionStats).values({
    sessionId: session.id,
    joinedCount: submittedCount,
    submittedCount,
    inProgressCount: 0,
    submittedScoreSum: scoreSum,
    averageScore: Math.round(scoreSum / submittedCount),
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    totalCorrect,
    totalWrong,
    totalSkipped,
    updatedAt: closedAt,
  });

  await db.insert(sessionQuestionStats).values(
    [q1, q2, q3].map((question) => ({
      sessionId: session.id,
      questionId: question.id,
      answeredCount: submittedCount,
      correctCount: Math.max(1, Math.round(submittedCount * 0.6)),
    })),
  );

  for (const student of submittedStudents) {
    const idx = submittedStudents.findIndex((row) => row.id === student.id);
    const correctCount = idx % 3 === 0 ? 3 : idx % 3 === 1 ? 2 : 1;
    const scorePercent = Math.round((correctCount / 3) * 100);
    await db.insert(studentStats).values({
      studentId: student.id,
      attemptCount: 1,
      submittedCount: 1,
      didntFinishCount: 0,
      submittedScoreSum: scorePercent,
      averageScore: scorePercent,
      highestScore: scorePercent,
      lowestScore: scorePercent,
      totalCorrect: correctCount,
      totalWrong: 3 - correctCount,
      totalSkipped: 0,
      updatedAt: closedAt,
    });
  }

  await db.insert(teacherStats).values({
    teacherId: teacher.id,
    quizCount: 2,
    sessionCount: 1,
    totalAttempts: submittedCount,
    submittedCount,
    liveInProgressCount: 0,
    didntFinishCount: 0,
    submittedScoreSum: scoreSum,
    overallAverageScore: Math.round(scoreSum / submittedCount),
    totalCorrect,
    totalWrong,
    totalSkipped,
    updatedAt: closedAt,
  });

  console.log(
    `Demo seed complete. Teacher login: ${DEMO_TEACHER_USERNAME} / ${DEMO_TEACHER_PASSWORD}`,
  );
  await client.end();
}

async function insertQuestion(
  db: ReturnType<typeof drizzle>,
  quizId: string,
  orderIndex: number,
  prompt: string,
  options: Array<{ text: string; isCorrect: boolean }>,
) {
  const [question] = await db
    .insert(questions)
    .values({ quizId, orderIndex, prompt })
    .returning({ id: questions.id });

  const inserted = await db
    .insert(questionOptions)
    .values(
      options.map((option, optionIndex) => ({
        questionId: question.id,
        orderIndex: optionIndex,
        text: option.text,
        isCorrect: option.isCorrect,
      })),
    )
    .returning({
      id: questionOptions.id,
      isCorrect: questionOptions.isCorrect,
    });

  return { id: question.id, options: inserted };
}

seedDemo().catch((error) => {
  console.error("Demo seed failed:", error);
  process.exit(1);
});
