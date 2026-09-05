"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ActionButton, ActionLink } from "@/components/ui/action-control";
import type { ActiveSessionInfo } from "@/lib/sessions";
import { launchQuizSession } from "@/server/actions/sessions";

type LaunchQuizButtonProps = {
  quizId: string;
  quizTitle: string;
  questionCount: number;
  activeSession: ActiveSessionInfo | null;
  compact?: boolean;
};

export function LaunchQuizButton({
  quizId,
  quizTitle,
  questionCount,
  activeSession,
  compact,
}: LaunchQuizButtonProps) {
  const t = useTranslations("session");
  const tActions = useTranslations("actions");
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
      <ActionLink action="live" href={`/teacher/quizzes/${quizId}`} compact={compact} />
    );
  }

  return (
    <>
      <ActionButton
        action="launch"
        compact={compact}
        disabled={!canLaunch || isLaunching}
        title={canLaunch ? undefined : t("needQuestion")}
        onClick={() => {
          if (otherQuizLive) {
            setReplaceDialogOpen(true);
            return;
          }

          void handleLaunch(false);
        }}
        label={isLaunching ? t("launching") : tActions("launch")}
      />

      <ConfirmDialog
        open={replaceDialogOpen}
        title={t("replaceTitle")}
        description={t("replaceDescription", { current: otherQuizLive?.quizTitle ?? quizTitle, next: quizTitle })}
        confirmLabel={isLaunching ? t("launching") : t("launchThis")}
        cancelLabel={tActions("cancel")}
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
