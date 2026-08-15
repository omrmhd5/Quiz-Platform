export type StudentHistoryRow = {
  attemptId: string;
  sessionId: string;
  quizId: string;
  quizTitle: string;
  sessionStatus: "waiting" | "active" | "closed";
  launchedAt: Date | null;
  status: "in_progress" | "submitted";
  scorePercent: number | null;
  correctCount: number | null;
  wrongCount: number | null;
  unansweredCount: number | null;
  submittedAt: Date | null;
};

export type StudentHistoryView = {
  studentId: string;
  studentName: string;
  registeredAt: Date;
  attemptCount: number;
  submittedCount: number;
  didntFinishCount: number;
  averageScore: number | null;
  highestScore: number | null;
  lowestScore: number | null;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  attempts: StudentHistoryRow[];
  page: number;
  pageCount: number;
  totalAttempts: number;
};
