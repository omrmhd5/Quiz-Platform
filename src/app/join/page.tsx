import { JoinForm } from "@/components/join/join-form";
import {
  cn,
  enterClassName,
  pageDescriptionClassName,
  pageTitleClassName,
} from "@/lib/utils";
import { getMessage } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";
import { getActiveSession } from "@/server/actions/sessions";

export const dynamic = "force-dynamic";

export default async function JoinPage() {
  const [activeSession, locale] = await Promise.all([
    getActiveSession(),
    getRequestLocale(),
  ]);

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8 sm:py-12">
      <div className={cn("w-full max-w-md space-y-8", enterClassName)}>
        <div className="text-center">
          <h1 className={pageTitleClassName}>
            {getMessage(locale, "join.title")}
          </h1>
          <p className={pageDescriptionClassName}>
            {getMessage(locale, "join.subtitle")}
          </p>
        </div>

        <JoinForm
          quizRunning={Boolean(activeSession)}
          quizTitle={activeSession?.quizTitle}
        />
      </div>
    </div>
  );
}
