"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ActionButton } from "@/components/ui/action-control";
import { deleteQuiz } from "@/server/actions/quizzes";

type DeleteQuizButtonProps = {
  quizId: string;
  quizTitle: string;
  sessionCount?: number;
  isLive?: boolean;
};

function getDeleteDescription({
  sessionCount = 0,
  isLive = false,
}: Pick<DeleteQuizButtonProps, "sessionCount" | "isLive">) {
  if (sessionCount > 0) {
    const sessionLabel = `${sessionCount} session${sessionCount === 1 ? "" : "s"}`;
    const liveNote = isLive
      ? " This quiz is live right now — students will immediately lose access."
      : "";

    return `All questions, ${sessionLabel}, student attempts, and results will be permanently removed.${liveNote} This cannot be undone.`;
  }

  return "All questions and options will be permanently removed. This cannot be undone.";
}

export function DeleteQuizButton({
  quizId,
  quizTitle,
  sessionCount = 0,
  isLive = false,
}: DeleteQuizButtonProps) {
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
          : "Could not delete quiz.",
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
        title={`Delete "${quizTitle}"?`}
        description={getDeleteDescription({ sessionCount, isLive })}
        confirmLabel={isDeleting ? "Deleting..." : "Delete quiz"}
        cancelLabel="Cancel"
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
