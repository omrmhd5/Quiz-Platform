"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ActionButton } from "@/components/ui/action-control";
import { deleteQuiz } from "@/server/actions/quizzes";

type DeleteQuizButtonProps = {
  quizId: string;
  quizTitle: string;
  sessionCount?: number;
  isLive?: boolean;
};

export function DeleteQuizButton({
  quizId,
  quizTitle,
  sessionCount = 0,
  isLive = false,
}: DeleteQuizButtonProps) {
  const t = useTranslations("quizzes");
  const tErrors = useTranslations("errors");
  const tActions = useTranslations("actions");
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteQuiz(quizId);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : tErrors("couldNotDeleteQuiz"),
      );
      setIsDeleting(false);
    }
  }

  return (
    <>
      <ActionButton
        action="delete"
        onClick={() => setOpen(true)}
        disabled={isDeleting}
      />

      <ConfirmDialog
        open={open}
        title={t("deleteTitle", { title: quizTitle })}
        description={sessionCount > 0 ? t("deleteWithHistory", { count: sessionCount, liveNote: isLive ? ` ${t("liveNow")}.` : "" }) : t("deleteEmpty")}
        confirmLabel={isDeleting ? t("deleting") : t("deleteQuiz")}
        cancelLabel={tActions("cancel")}
        variant="danger"
        isPending={isDeleting}
        onConfirm={handleConfirm}
        onCancel={() => {
          if (!isDeleting) {
            setOpen(false);
            setError(null);
          }
        }}
      />

      {error && open ? (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </>
  );
}
