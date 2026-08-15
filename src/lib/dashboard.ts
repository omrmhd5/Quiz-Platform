export const DASHBOARD_RECENT_SESSIONS = 5;
export const DASHBOARD_TREND_SESSIONS = 10;
export const DASHBOARD_ATTEMPT_HIGHLIGHTS = 10;

export type DashboardRecentSession = {
  sessionId: string;
  quizId: string;
  quizTitle: string;
  status: "waiting" | "active" | "closed";
  launchedAt: Date | null;
  joinedCount: number;
  submittedCount: number;
  averageScore: number | null;
};

export type DashboardScoreTrendPoint = {
  sessionId: string;
  quizTitle: string;
  launchedAt: Date | null;
  averageScore: number | null;
  label: string;
};

export type DashboardAttemptRow = {
  attemptId: string;
  studentId: string;
  studentName: string;
  quizId: string;
  quizTitle: string;
  sessionId: string;
  submittedAt: Date | null;
  scorePercent: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
};

export type DashboardSessionResultRow = {
  sessionId: string;
  quizId: string;
  quizTitle: string;
  status: "waiting" | "active" | "closed";
  launchedAt: Date | null;
  joinedCount: number;
  submittedCount: number;
  averageScore: number | null;
  highestScore: number | null;
  lowestScore: number | null;
};

export type DashboardView = {
  studentCount: number;
  quizCount: number;
  sessionCount: number;
  totalAttempts: number;
  submittedCount: number;
  liveInProgressCount: number;
  didntFinishCount: number;
  overallAverageScore: number | null;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  recentSessions: DashboardRecentSession[];
  scoreTrend: DashboardScoreTrendPoint[];
  submittedAttempts: DashboardAttemptRow[];
  sessionResults: DashboardSessionResultRow[];
};
