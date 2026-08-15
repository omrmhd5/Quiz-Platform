"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useModalMotion } from "@/lib/use-modal-motion";
import { buttonSecondaryClassName, cn } from "@/lib/utils";

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
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "ui-modal-panel flex max-h-[90vh] flex-col",
          sizeClassName[size],
        )}>
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-200 pb-4">
          <div className="min-w-0 space-y-1">
            <h2
              id={titleId}
              className="text-lg font-semibold tracking-tight text-zinc-900">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-sm text-zinc-600">
                {description}
              </p>
            ) : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className={cn(buttonSecondaryClassName, "ui-btn-sm shrink-0")}>
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pt-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
