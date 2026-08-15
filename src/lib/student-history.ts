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
  averageScore: number | null;
  attempts: StudentHistoryRow[];
};
