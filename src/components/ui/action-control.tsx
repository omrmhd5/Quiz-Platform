"use client";

import Link from "next/link";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { useTranslations } from "next-intl";
import { UiIcon } from "@/components/ui/icon";
import { type ActionKey, actionPresets } from "@/lib/action-ui";
import { buttonSecondaryClassName, cn } from "@/lib/utils";

type ActionSize = "sm" | "md";

function getActionClasses(action: ActionKey, size: ActionSize, className?: string) {
  const preset = actionPresets[action];

  return cn(
    preset.buttonClassName ?? buttonSecondaryClassName,
    size === "sm" && "ui-btn-sm",
    className,
  );
}

type ActionLinkProps = {
  action: ActionKey;
  href: string;
  label?: string;
  size?: ActionSize;
  className?: string;
  hideLabel?: boolean;
  compact?: boolean;
};

export function ActionLink({
  action,
  href,
  label,
  size = "sm",
  className,
  hideLabel,
  compact,
}: ActionLinkProps) {
  const t = useTranslations("actions");
  const preset = actionPresets[action];
  const text = label ?? t(action);
  const showLabel = !hideLabel && !preset.hideLabel;
  const labelHidden = compact && showLabel;

  return (
    <Link
      href={href}
      className={getActionClasses(action, size, className)}
      aria-label={!showLabel || labelHidden ? text : undefined}>
      <UiIcon icon={preset.icon} />
      {showLabel ? (
        <span className={cn(compact && "hidden sm:inline")}>{text}</span>
      ) : null}
    </Link>
  );
}

type ActionButtonProps = {
  action: ActionKey;
  label?: string;
  size?: ActionSize;
  className?: string;
  hideLabel?: boolean;
  compact?: boolean;
} & ComponentPropsWithoutRef<"button">;

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  function ActionButton(
    {
      action,
      label,
      size = "sm",
      className,
      hideLabel,
      compact,
      children,
      type = "button",
      ...props
    },
    ref,
  ) {
    const t = useTranslations("actions");
    const preset = actionPresets[action];
    const text = label ?? t(action);
    const showLabel = !hideLabel && !preset.hideLabel;
    const labelHidden = compact && showLabel;

    return (
      <button
        ref={ref}
        type={type}
        className={getActionClasses(action, size, className)}
        aria-label={!showLabel || labelHidden ? text : undefined}
        {...props}>
        <UiIcon icon={preset.icon} />
        {children ??
          (showLabel ? (
            <span className={cn(compact && "hidden sm:inline")}>{text}</span>
          ) : null)}
      </button>
    );
  },
);
