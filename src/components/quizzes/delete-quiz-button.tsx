"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { buttonDangerClassName, cn } from "@/lib/utils";
import { deleteQuiz } from "@/server/actions/quizzes";

type DeleteQuizButtonProps = {
  quizId: string;
  quizTitle: string;
};

export function DeleteQuizButton({ quizId, quizTitle }: DeleteQuizButtonProps) {
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isDeleting}
        className={cn(buttonDangerClassName, "ui-btn-sm")}
      >
        Delete
      </button>

      <ConfirmDialog
        open={open}
        title={`Delete "${quizTitle}"?`}
        description="All questions and options will be permanently removed. This cannot be undone."
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
