import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/auth";
import {
  cn,
  enterClassName,
  pageDescriptionClassName,
  pageTitleClassName,
  panelClassName,
} from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getSession();

  if (session.isLoggedIn) {
    redirect("/teacher/dashboard");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div
        className={cn(panelClassName, enterClassName, "w-full max-w-md p-8")}>
        <div className="mb-8">
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
