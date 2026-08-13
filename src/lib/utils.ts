import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const inputClassName = cn(
  "ui-input w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400",
  "focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10",
);

export const buttonPrimaryClassName = cn("ui-btn ui-btn-primary ui-press");

export const buttonSecondaryClassName = cn("ui-btn ui-btn-secondary ui-press");

export const buttonGhostClassName = cn("ui-btn ui-btn-ghost ui-press");

export const buttonDangerClassName = cn("ui-btn ui-btn-danger ui-press");

export const navLinkClassName = cn("ui-btn-nav ui-press");

export const brandLinkClassName = "ui-brand-link";

export const linkClassName = "ui-link";

export const panelClassName = "ui-panel";

export const methodCardClassName = cn(
  panelClassName,
  "ui-method-card ui-btn ui-press",
);

export const statCardClassName = cn("ui-panel ui-stat");

export const pageTitleClassName =
  "text-2xl font-semibold tracking-tight text-zinc-900";

export const pageDescriptionClassName = "mt-1 text-sm text-zinc-600";

export const alertErrorClassName =
  "ui-alert-enter rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800";

export const alertSuccessClassName =
  "ui-alert-enter rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800";

export const enterClassName = "ui-enter";
