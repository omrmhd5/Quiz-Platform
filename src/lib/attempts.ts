export type ShuffledOption = {
  id: string;
  text: string;
  letter: string;
};

export type ShuffledQuestion = {
  id: string;
  prompt: string;
  number: number;
  options: ShuffledOption[];
};

export type AttemptQuizView = {
  attemptId: string;
  quizTitle: string;
  studentName: string;
  totalQuestions: number;
  questions: ShuffledQuestion[];
};

export type AttemptResultsView = {
  attemptId: string;
  quizTitle: string;
  studentName: string;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  scorePercent: number;
};

export type SubmitAttemptState = {
  error?: string;
};

export const submitAttemptInitialState: SubmitAttemptState = {};
