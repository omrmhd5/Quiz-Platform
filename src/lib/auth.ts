import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { defaultSession, getSessionOptions, type SessionData } from "./session";

export const getSession = cache(async () => {
  const session = await getIronSession<SessionData>(
    await cookies(),
    getSessionOptions(),
  );

  if (!session.isLoggedIn) {
    return { ...defaultSession };
  }

  return session;
});

export const requireTeacherSession = cache(async () => {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  return session;
});
