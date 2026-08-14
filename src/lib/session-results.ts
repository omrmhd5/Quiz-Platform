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

export type SessionResultsView = {
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
  attempts: SessionAttemptRow[];
};
