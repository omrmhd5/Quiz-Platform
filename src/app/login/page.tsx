import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getSession();

  if (session.isLoggedIn) {
    redirect("/teacher/dashboard");
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Quiz Platform
          </p>
          <h1 className="text-2xl font-semibold text-zinc-900">Teacher Login</h1>
          <p className="text-sm text-zinc-500">
            Sign in to manage students, quizzes, and results.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
