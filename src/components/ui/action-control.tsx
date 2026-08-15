import Link from "next/link";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
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
};

export function ActionLink({
  action,
  href,
  label,
  size = "sm",
  className,
  hideLabel,
}: ActionLinkProps) {
  const preset = actionPresets[action];
  const text = label ?? preset.label;
  const showLabel = !hideLabel && !preset.hideLabel;

  return (
    <Link
      href={href}
      className={getActionClasses(action, size, className)}
      aria-label={showLabel ? undefined : text}>
      <UiIcon icon={preset.icon} />
      {showLabel ? <span>{text}</span> : null}
    </Link>
  );
}

type ActionButtonProps = {
  action: ActionKey;
  label?: string;
  size?: ActionSize;
  className?: string;
  hideLabel?: boolean;
} & ComponentPropsWithoutRef<"button">;

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  function ActionButton(
    {
      action,
      label,
      size = "sm",
      className,
      hideLabel,
      children,
      type = "button",
      ...props
    },
    ref,
  ) {
    const preset = actionPresets[action];
    const text = label ?? preset.label;
    const showLabel = !hideLabel && !preset.hideLabel;

    return (
      <button
        ref={ref}
        type={type}
        className={getActionClasses(action, size, className)}
        aria-label={showLabel ? undefined : text}
        {...props}>
        <UiIcon icon={preset.icon} />
        {children ?? (showLabel ? <span>{text}</span> : null)}
      </button>
    );
  },
);
