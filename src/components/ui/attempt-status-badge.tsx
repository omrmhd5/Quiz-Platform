import { UiIcon } from "@/components/ui/icon";
import { statPresets } from "@/lib/stat-ui";
import { badgeClassName, cn } from "@/lib/utils";

export type AttemptStatusKind = "submitted" | "inProgress" | "didntFinish";

const statusPresetKey: Record<
  AttemptStatusKind,
  keyof Pick<typeof statPresets, "submitted" | "inProgress" | "didntFinish">
> = {
  submitted: "submitted",
  inProgress: "inProgress",
  didntFinish: "didntFinish",
};

export function resolveAttemptStatus(
  sessionStatus: "active" | "closed" | "waiting",
  attemptStatus: string,
  labels: Record<AttemptStatusKind, string>,
): {
  kind: AttemptStatusKind;
  label: string;
  className: string;
} {
  if (attemptStatus === "submitted") {
    return {
      kind: "submitted",
      label: labels.submitted,
      className: "ui-badge-success",
    };
  }

  if (sessionStatus === "closed") {
    return {
      kind: "didntFinish",
      label: labels.didntFinish,
      className: "ui-badge-danger",
    };
  }

  return {
    kind: "inProgress",
    label: labels.inProgress,
    className: "ui-badge-progress",
  };
}

export function AttemptStatusBadge({
  kind,
  label,
  className,
}: {
  kind: AttemptStatusKind;
  label: string;
  className: string;
}) {
  const preset = statPresets[statusPresetKey[kind]];

  return (
    <span
      className={cn(
        badgeClassName,
        "ui-badge inline-flex items-center gap-1",
        className,
      )}>
      <UiIcon icon={preset.icon} className="size-3" />
      {label}
    </span>
  );
}
