import { eq } from "drizzle-orm";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { teachers } from "@/db/schema";
import { defaultSession, getSessionOptions, type SessionData } from "./session";

export async function getSession() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    getSessionOptions(),
  );

  if (!session.isLoggedIn) {
    return { ...defaultSession };
  }

  return session;
}

async function destroySession() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    getSessionOptions(),
  );
  session.destroy();
}

export async function clearSessionIfInvalid() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return;
  }

  const [teacher] = await db
    .select({ id: teachers.id })
    .from(teachers)
    .where(eq(teachers.id, session.teacherId))
    .limit(1);

  if (!teacher) {
    await destroySession();
  }
}

export async function requireTeacherSession() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  const [teacher] = await db
    .select({ id: teachers.id })
    .from(teachers)
    .where(eq(teachers.id, session.teacherId))
    .limit(1);

  if (!teacher) {
    await destroySession();
    redirect("/login");
  }

  return session;
}
