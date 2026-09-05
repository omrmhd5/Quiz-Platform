"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import { ActionButton } from "@/components/ui/action-control";
import { useModalMotion } from "@/lib/use-modal-motion";
import { cn } from "@/lib/utils";

type ContentModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  size?: "md" | "lg" | "xl";
};

const sizeClassName = {
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function ContentModal({
  open,
  title,
  description,
  onClose,
  children,
  size = "md",
}: ContentModalProps) {
  const t = useTranslations("actions");
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const visible = useModalMotion(open);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="ui-modal-root" data-open={visible ? "true" : "false"}>
      <button
        type="button"
        className="ui-modal-backdrop"
        aria-label={t("closeDialog")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "ui-modal-panel flex max-h-[90vh] w-full max-w-[calc(100vw-1.5rem)] flex-col",
          sizeClassName[size],
        )}>
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-200 pb-4 sm:gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <h2
              id={titleId}
              className="break-words text-lg font-semibold tracking-tight text-zinc-900">
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                className="break-words text-sm text-zinc-600">
                {description}
              </p>
            ) : null}
          </div>
          <ActionButton
            ref={closeRef}
            action="cancel"
            label={t("closeDialog")}
            onClick={onClose}
            className="shrink-0"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto pt-4">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
