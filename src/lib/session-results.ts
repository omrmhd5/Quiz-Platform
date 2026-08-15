export type SessionAttemptRow = {
  attemptId: string;
  studentId: string;
  studentName: string;
  status: "in_progress" | "submitted";
  scorePercent: number | null;
  correctCount: number | null;
  wrongCount: number | null;
  unansweredCount: number | null;
  submittedAt: Date | null;
};

export type SessionQuestionStat = {
  questionId: string;
  orderIndex: number;
  prompt: string;
  answeredCount: number;
  correctPercent: number | null;
};

export type SessionSummaryView = {
  sessionId: string;
  quizId: string;
  quizTitle: string;
  status: "waiting" | "active" | "closed";
  launchedAt: Date | null;
  closedAt: Date | null;
  joinedCount: number;
  submittedCount: number;
  inProgressCount: number;
  averageScore: number | null;
  highestScore: number | null;
  lowestScore: number | null;
};

export type SessionResultsView = SessionSummaryView & {
  registeredCount: number;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  questionStats: SessionQuestionStat[];
  attempts: SessionAttemptRow[];
};
