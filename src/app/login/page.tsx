import { DemoLoginCard } from "@/components/demo-login-card";
import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/auth";
import {
  cn,
  enterClassName,
  pageDescriptionClassName,
  pageTitleClassName,
  panelClassName,
} from "@/lib/utils";
import { getMessage } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  const locale = await getRequestLocale();

  if (session.isLoggedIn) {
    redirect("/teacher/dashboard");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div
          className={cn(
            panelClassName,
            enterClassName,
            "w-full p-5 sm:p-8",
          )}>
          <div className="mb-6 sm:mb-8">
            <h1 className={pageTitleClassName}>
              {getMessage(locale, "login.title")}
            </h1>
            <p className={pageDescriptionClassName}>
              {getMessage(locale, "login.subtitle")}
            </p>
          </div>
          <LoginForm />
        </div>
        <DemoLoginCard />
      </div>
    </div>
  );
}
