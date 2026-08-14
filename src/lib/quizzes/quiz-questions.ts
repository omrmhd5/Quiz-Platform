export type QuizQuestionView = {
  id: string;
  prompt: string;
  options: Array<{
    id: string;
    text: string;
    orderIndex: number;
    isCorrect: boolean;
  }>;
};
