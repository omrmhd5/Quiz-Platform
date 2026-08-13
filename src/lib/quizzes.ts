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

export function validateQuizTitle(title: string): string | null {
  const trimmed = title.trim();

  if (!trimmed) {
    return "Quiz title is required.";
  }

  if (trimmed.length > 120) {
    return "Quiz title must be 120 characters or fewer.";
  }

  return null;
}

export function validateQuizQuestions(
  questions: QuizQuestionPayload[],
): string | null {
  if (questions.length < 1) {
    return "Add at least one question.";
  }

  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    const label = `Question ${index + 1}`;

    if (!question.prompt.trim()) {
      return `${label}: enter the question text.`;
    }

    if (question.options.length < 2 || question.options.length > 6) {
      return `${label}: must have between 2 and 6 options.`;
    }

    const correctCount = question.options.filter(
      (option) => option.isCorrect,
    ).length;

    if (correctCount !== 1) {
      return `${label}: select exactly one correct answer.`;
    }

    for (
      let optionIndex = 0;
      optionIndex < question.options.length;
      optionIndex += 1
    ) {
      const option = question.options[optionIndex];
      const letter = String.fromCharCode(65 + optionIndex);

      if (!option.text.trim()) {
        return `${label}, option ${letter}: answer text cannot be empty.`;
      }
    }
  }

  return null;
}

export function validateQuestionDrafts(
  drafts: QuizQuestionDraft[],
): string | null {
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
