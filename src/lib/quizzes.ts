import { msg, type TMsg } from "@/lib/i18n/messages";

export type QuizActionState = {
  error?: string;
  success?: string;
  quizId?: string;
};

export const quizActionInitialState: QuizActionState = {};

export type QuizQuestionPayload = {
  prompt: string;
  options: Array<{ text: string; isCorrect: boolean }>;
};

export type QuizOptionDraft = {
  id: string;
  text: string;
};

export type QuizQuestionDraft = {
  id: string;
  prompt: string;
  options: QuizOptionDraft[];
  correctOptionId: string;
};

export function createEmptyQuestion(): QuizQuestionDraft {
  const options: QuizOptionDraft[] = Array.from({ length: 4 }, () => ({
    id: crypto.randomUUID(),
    text: "",
  }));

  return {
    id: crypto.randomUUID(),
    prompt: "",
    options,
    correctOptionId: "",
  };
}

export function validateQuizTitle(title: string): TMsg | null {
  const trimmed = title.trim();

  if (!trimmed) {
    return msg("errors.titleRequired");
  }

  if (trimmed.length > 120) {
    return msg("errors.titleTooLong");
  }

  return null;
}

export function validateQuizQuestions(
  questions: QuizQuestionPayload[],
): TMsg | null {
  if (questions.length < 1) {
    return msg("errors.addOneQuestion");
  }

  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    const n = index + 1;

    if (!question.prompt.trim()) {
      return msg("errors.questionPrompt", { n });
    }

    if (question.options.length < 2 || question.options.length > 6) {
      return msg("errors.questionOptionCount", { n });
    }

    const correctCount = question.options.filter(
      (option) => option.isCorrect,
    ).length;

    if (correctCount !== 1) {
      return msg("errors.questionOneCorrect", { n });
    }

    for (
      let optionIndex = 0;
      optionIndex < question.options.length;
      optionIndex += 1
    ) {
      const option = question.options[optionIndex];
      const letter = String.fromCharCode(65 + optionIndex);

      if (!option.text.trim()) {
        return msg("errors.optionEmpty", { n, letter });
      }
    }
  }

  return null;
}

export function validateQuestionDrafts(
  drafts: QuizQuestionDraft[],
): TMsg | null {
  return validateQuizQuestions(draftsToPayload(drafts));
}

export function draftsToPayload(
  drafts: QuizQuestionDraft[],
): QuizQuestionPayload[] {
  return drafts.map((draft) => ({
    prompt: draft.prompt.trim(),
    options: draft.options.map((option) => ({
      text: option.text.trim(),
      isCorrect: option.id === draft.correctOptionId,
    })),
  }));
}

export function payloadToDrafts(
  questions: QuizQuestionPayload[],
): QuizQuestionDraft[] {
  return questions.map((question) => {
    const options = question.options.map((option) => ({
      id: crypto.randomUUID(),
      text: option.text,
    }));
    const correctIndex = question.options.findIndex(
      (option) => option.isCorrect,
    );

    return {
      id: crypto.randomUUID(),
      prompt: question.prompt,
      options,
      correctOptionId:
        options[correctIndex >= 0 ? correctIndex : 0]?.id ??
        options[0]?.id ??
        "",
    };
  });
}

type QuizQuestionExport = {
  prompt: string;
  options: Array<{ orderIndex: number; text: string; isCorrect: boolean }>;
};

export function quizQuestionsToPayload(
  questions: QuizQuestionExport[],
): QuizQuestionPayload[] {
  return questions.map((question) => ({
    prompt: question.prompt,
    options: question.options.map((option) => ({
      text: option.text,
      isCorrect: option.isCorrect,
    })),
  }));
}
