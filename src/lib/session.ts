import type { SessionOptions } from "iron-session";

export interface SessionData {
  teacherId: string;
  username: string;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  teacherId: "",
  username: "",
  isLoggedIn: false,
};

function getSessionPassword() {
  const secret = process.env.SESSION_SECRET;

  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === "development") {
    return "dev-session-secret-must-be-32-chars-min";
  }

  throw new Error("SESSION_SECRET must be at least 32 characters.");
}

export function getSessionOptions(): SessionOptions {
  return {
    password: getSessionPassword(),
    cookieName: "quiz-platform-session",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    },
  };
}
