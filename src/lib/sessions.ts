export type JoinActionState = {
  error?: string;
};

export const joinActionInitialState: JoinActionState = {};

export type LaunchActionState = {
  error?: string;
  success?: string;
};

export const launchActionInitialState: LaunchActionState = {};

export type ActiveSessionInfo = {
  sessionId: string;
  quizId: string;
  quizTitle: string;
  launchedAt: Date | null;
};
