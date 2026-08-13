import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const quizStatusEnum = pgEnum("quiz_status", ["draft", "saved"]);
export const sessionStatusEnum = pgEnum("session_status", [
  "waiting",
  "active",
  "closed",
]);
export const attemptStatusEnum = pgEnum("attempt_status", [
  "in_progress",
  "submitted",
]);

export const teachers = pgTable("teachers", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const students = pgTable("students", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const quizzes = pgTable("quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  status: quizStatusEnum("status").default("draft").notNull(),
  questionCount: integer("question_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    quizId: uuid("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    orderIndex: integer("order_index").notNull(),
    prompt: text("prompt").notNull(),
  },
  (table) => [index("questions_quiz_id_idx").on(table.quizId)],
);

export const questionOptions = pgTable(
  "question_options",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    orderIndex: integer("order_index").notNull(),
    text: text("text").notNull(),
    isCorrect: boolean("is_correct").default(false).notNull(),
  },
  (table) => [index("question_options_question_id_idx").on(table.questionId)],
);

export const quizSessions = pgTable(
  "quiz_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    quizId: uuid("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    status: sessionStatusEnum("status").default("waiting").notNull(),
    launchedAt: timestamp("launched_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
  },
  (table) => [index("quiz_sessions_status_idx").on(table.status)],
);

export const attempts = pgTable(
  "attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => quizSessions.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    status: attemptStatusEnum("status").default("in_progress").notNull(),
    correctCount: integer("correct_count").default(0).notNull(),
    wrongCount: integer("wrong_count").default(0).notNull(),
    unansweredCount: integer("unanswered_count").default(0).notNull(),
    scorePercent: doublePrecision("score_percent").default(0).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("attempts_session_student_unique").on(
      table.sessionId,
      table.studentId,
    ),
    index("attempts_session_id_idx").on(table.sessionId),
  ],
);

export const attemptAnswers = pgTable(
  "attempt_answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => attempts.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    selectedOptionId: uuid("selected_option_id").references(
      () => questionOptions.id,
      { onDelete: "set null" },
    ),
    isCorrect: boolean("is_correct").default(false).notNull(),
  },
  (table) => [
    uniqueIndex("attempt_answers_attempt_question_unique").on(
      table.attemptId,
      table.questionId,
    ),
  ],
);

export const attemptQuestionOrder = pgTable(
  "attempt_question_order",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => attempts.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    displayOrder: integer("display_order").notNull(),
  },
  (table) => [
    uniqueIndex("attempt_question_order_unique").on(
      table.attemptId,
      table.questionId,
    ),
  ],
);

export const attemptOptionOrder = pgTable(
  "attempt_option_order",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => attempts.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    optionId: uuid("option_id")
      .notNull()
      .references(() => questionOptions.id, { onDelete: "cascade" }),
    displayOrder: integer("display_order").notNull(),
  },
  (table) => [
    uniqueIndex("attempt_option_order_unique").on(
      table.attemptId,
      table.questionId,
      table.optionId,
    ),
  ],
);
