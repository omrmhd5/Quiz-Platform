"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useModalMotion } from "@/lib/use-modal-motion";
import {
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  cn,
} from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "default",
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const t = useTranslations("actions");
  const confirmText = confirmLabel ?? t("confirm");
  const cancelText = cancelLabel ?? t("cancel");
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const visible = useModalMotion(open);

  useEffect(() => {
    if (!open) {
      return;
    }

    cancelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        onCancel();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, isPending, onCancel]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="ui-modal-root" data-open={visible ? "true" : "false"}>
      <button
        type="button"
        className="ui-modal-backdrop"
        aria-label={t("closeDialog")}
        disabled={isPending}
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="ui-modal-panel max-h-[92vh] w-full max-w-md overflow-y-auto">
        <h2
          id={titleId}
          className="break-words text-lg font-semibold tracking-tight text-zinc-900">
          {title}
        </h2>
        <p
          id={descriptionId}
          className="mt-2 max-h-48 overflow-y-auto break-words text-sm text-zinc-600">
          {description}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className={cn(buttonSecondaryClassName, "w-full sm:min-w-24 sm:w-auto")}>
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className={cn(
              variant === "danger"
                ? "ui-btn ui-btn-danger-solid ui-press"
                : buttonPrimaryClassName,
              "w-full sm:min-w-24 sm:w-auto",
            )}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
