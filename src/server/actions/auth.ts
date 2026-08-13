"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { teachers } from "@/db/schema";
import { getSessionOptions, type SessionData } from "@/lib/session";

export type LoginState = {
  error?: string;
};

export async function loginTeacher(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  const [teacher] = await db
    .select()
    .from(teachers)
    .where(eq(teachers.username, username))
    .limit(1);

  if (!teacher) {
    return { error: "Invalid username or password." };
  }

  const isValid = await bcrypt.compare(password, teacher.passwordHash);

  if (!isValid) {
    return { error: "Invalid username or password." };
  }

  const session = await getIronSession<SessionData>(
    await cookies(),
    getSessionOptions(),
  );

  session.teacherId = teacher.id;
  session.username = teacher.username;
  session.isLoggedIn = true;
  await session.save();

  redirect("/teacher/dashboard");
}

export async function logoutTeacher() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    getSessionOptions(),
  );

  session.destroy();
  redirect("/login");
}
