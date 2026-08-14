import { JoinForm } from "@/components/join/join-form";
import {
  cn,
  enterClassName,
  pageDescriptionClassName,
  pageTitleClassName,
} from "@/lib/utils";
import { getActiveSession } from "@/server/actions/sessions";

export default async function JoinPage() {
  const activeSession = await getActiveSession();

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className={cn("w-full max-w-md space-y-8", enterClassName)}>
        <div className="text-center">
          <h1 className={pageTitleClassName}>Join quiz</h1>
          <p className={pageDescriptionClassName}>
            Enter your student ID to join the live quiz.
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
