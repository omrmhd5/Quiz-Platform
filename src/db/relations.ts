import { relations } from "drizzle-orm";
import {
  attemptAnswers,
  attemptOptionOrder,
  attemptQuestionOrder,
  attempts,
  questionOptions,
  questions,
  quizSessions,
  quizzes,
  students,
  teachers,
} from "./schema";

export const teachersRelations = relations(teachers, ({ many }) => ({
  quizzes: many(quizzes),
}));

export const studentsRelations = relations(students, ({ many }) => ({
  attempts: many(attempts),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  teacher: one(teachers, {
    fields: [quizzes.teacherId],
    references: [teachers.id],
  }),
  questions: many(questions),
  sessions: many(quizSessions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
  options: many(questionOptions),
}));

export const questionOptionsRelations = relations(
  questionOptions,
  ({ one }) => ({
    question: one(questions, {
      fields: [questionOptions.questionId],
      references: [questions.id],
    }),
  }),
);

export const quizSessionsRelations = relations(
  quizSessions,
  ({ one, many }) => ({
    quiz: one(quizzes, {
      fields: [quizSessions.quizId],
      references: [quizzes.id],
    }),
    attempts: many(attempts),
  }),
);

export const attemptsRelations = relations(attempts, ({ one, many }) => ({
  session: one(quizSessions, {
    fields: [attempts.sessionId],
    references: [quizSessions.id],
  }),
  student: one(students, {
    fields: [attempts.studentId],
    references: [students.id],
  }),
  answers: many(attemptAnswers),
  questionOrder: many(attemptQuestionOrder),
  optionOrder: many(attemptOptionOrder),
}));

export const attemptAnswersRelations = relations(attemptAnswers, ({ one }) => ({
  attempt: one(attempts, {
    fields: [attemptAnswers.attemptId],
    references: [attempts.id],
  }),
  question: one(questions, {
    fields: [attemptAnswers.questionId],
    references: [questions.id],
  }),
  selectedOption: one(questionOptions, {
    fields: [attemptAnswers.selectedOptionId],
    references: [questionOptions.id],
  }),
}));

export const attemptQuestionOrderRelations = relations(
  attemptQuestionOrder,
  ({ one }) => ({
    attempt: one(attempts, {
      fields: [attemptQuestionOrder.attemptId],
      references: [attempts.id],
    }),
    question: one(questions, {
      fields: [attemptQuestionOrder.questionId],
      references: [questions.id],
    }),
  }),
);

export const attemptOptionOrderRelations = relations(
  attemptOptionOrder,
  ({ one }) => ({
    attempt: one(attempts, {
      fields: [attemptOptionOrder.attemptId],
      references: [attempts.id],
    }),
    question: one(questions, {
      fields: [attemptOptionOrder.questionId],
      references: [questions.id],
    }),
    option: one(questionOptions, {
      fields: [attemptOptionOrder.optionId],
      references: [questionOptions.id],
    }),
  }),
);
