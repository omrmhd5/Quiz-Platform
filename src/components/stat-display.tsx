import { cn, statLabelClassName, statValueClassName } from "@/lib/utils";

type StatDisplayProps = {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
};

export function StatDisplay({
  label,
  value,
  valueClassName,
}: StatDisplayProps) {
  return (
    <>
      <p className={statLabelClassName}>{label}</p>
      <p className={cn(statValueClassName, valueClassName)}>{value}</p>
    </>
  );
}
