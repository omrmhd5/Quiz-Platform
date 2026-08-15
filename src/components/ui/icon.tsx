import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type UiIconProps = {
  icon: LucideIcon;
  className?: string;
  label?: string;
};

export function UiIcon({ icon: Icon, className, label }: UiIconProps) {
  return (
    <Icon
      className={cn("size-4 shrink-0", className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    />
  );
}
