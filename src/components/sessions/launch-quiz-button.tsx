"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { ActiveSessionInfo } from "@/lib/sessions";
import {
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  cn,
} from "@/lib/utils";
import { launchQuizSession } from "@/server/actions/sessions";

type LaunchQuizButtonProps = {
  quizId: string;
  quizTitle: string;
  questionCount: number;
  activeSession: ActiveSessionInfo | null;
};

export function LaunchQuizButton({
  quizId,
  quizTitle,
  questionCount,
  activeSession,
}: LaunchQuizButtonProps) {
  const router = useRouter();
  const [isLaunching, setIsLaunching] = useState(false);
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);

  const isThisQuizLive = activeSession?.quizId === quizId;
  const otherQuizLive =
    activeSession && activeSession.quizId !== quizId ? activeSession : null;
  const canLaunch = questionCount > 0;

  async function handleLaunch(replaceActive: boolean) {
    setIsLaunching(true);

    try {
      const result = await launchQuizSession(quizId, replaceActive);

      if ("error" in result && result.error) {
        return;
      }

      setReplaceDialogOpen(false);
      router.refresh();
    } finally {
      setIsLaunching(false);
    }
  }

  if (isThisQuizLive) {
    return (
      <Link
        href={`/teacher/quizzes/${quizId}`}
        className={cn(
          buttonSecondaryClassName,
          "ui-btn-sm border-green-200 bg-green-50 text-green-800 hover:bg-green-100",
        )}>
        Live
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={!canLaunch || isLaunching}
        title={canLaunch ? undefined : "Add at least one question first"}
        onClick={() => {
          if (otherQuizLive) {
            setReplaceDialogOpen(true);
            return;
          }

          void handleLaunch(false);
        }}
        className={cn(buttonPrimaryClassName, "ui-btn-sm")}>
        {isLaunching ? "Launching..." : "Launch"}
      </button>

      <ConfirmDialog
        open={replaceDialogOpen}
        title="Replace live quiz?"
        description={`"${otherQuizLive?.quizTitle ?? "The current quiz"}" is live. Launching "${quizTitle}" will close that session.`}
        confirmLabel={isLaunching ? "Launching..." : "Launch this quiz"}
        cancelLabel="Cancel"
        variant="danger"
        isPending={isLaunching}
        onConfirm={() => handleLaunch(true)}
        onCancel={() => {
          if (!isLaunching) {
            setReplaceDialogOpen(false);
          }
        }}
      />
    </>
  );
}
