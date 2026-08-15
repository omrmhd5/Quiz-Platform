import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { UiIcon } from "@/components/ui/icon";
import { statPresets, type StatTone } from "@/lib/stat-ui";
import {
  cn,
  statCardClassName,
  statLabelClassName,
  statValueClassName,
} from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: ReactNode;
  preset?: keyof typeof statPresets;
  tone?: StatTone;
  icon?: LucideIcon;
  className?: string;
  valueClassName?: string;
};

export function StatCard({
  label,
  value,
  preset,
  tone,
  icon,
  className,
  valueClassName,
}: StatCardProps) {
  const resolved = preset ? statPresets[preset] : null;
  const Icon = icon ?? resolved?.icon;
  const resolvedTone = tone ?? resolved?.tone ?? "neutral";

  return (
    <div
      className={cn(
        statCardClassName,
        "ui-stat-card",
        `ui-stat-card--${resolvedTone}`,
        className,
      )}>
      {Icon ? (
        <div className="ui-stat-card__icon" aria-hidden="true">
          <UiIcon icon={Icon} className="size-[18px]" />
        </div>
      ) : null}
      <p className={statLabelClassName}>{label}</p>
      <p className={cn(statValueClassName, valueClassName)}>{value}</p>
    </div>
  );
}
