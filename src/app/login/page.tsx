import { LoginForm } from "@/components/login-form";
import { clearSessionIfInvalid, getSession } from "@/lib/auth";
import {
  cn,
  enterClassName,
  pageDescriptionClassName,
  pageTitleClassName,
  panelClassName,
} from "@/lib/utils";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { teachers } from "@/db/schema";

export default async function LoginPage() {
  await clearSessionIfInvalid();
  const session = await getSession();

  if (session.isLoggedIn) {
    const [teacher] = await db
      .select({ id: teachers.id })
      .from(teachers)
      .where(eq(teachers.id, session.teacherId))
      .limit(1);

    if (teacher) {
      redirect("/teacher/dashboard");
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8 sm:py-12">
      <div
        className={cn(
          panelClassName,
          enterClassName,
          "w-full max-w-md p-5 sm:p-8",
        )}>
        <div className="mb-6 sm:mb-8">
          <h1 className={pageTitleClassName}>Teacher login</h1>
          <p className={pageDescriptionClassName}>
            Sign in to manage students, quizzes, and results.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
