import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const inputClassName = cn(
  "ui-input w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400",
  "focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10",
);

export const labelClassName = "ui-label";

export const buttonPrimaryClassName = cn("ui-btn ui-btn-primary ui-press");

export const buttonSecondaryClassName = cn("ui-btn ui-btn-secondary ui-press");

export const buttonSuccessClassName = cn("ui-btn ui-btn-success ui-press");

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

export const segmentClassName = "ui-segment";

export const emptyStateClassName = "ui-empty";

export const tableShellClassName = "ui-table-shell";

export const liveBannerClassName = cn(panelClassName, "ui-live-banner");

export const optionLabelClassName = "ui-option";

export const pageEnterClassName = "ui-page";

export const enterClassName = "ui-enter";

export const scoreHeroClassName = "ui-score-hero";

export const badgeClassName = "ui-badge";

export const sectionHeaderClassName = "ui-section-header";

export const sectionTitleClassName = "ui-section-title";

export const sectionDescriptionClassName = "ui-section-description";

export const statLabelClassName = "ui-stat-label";

export const statValueClassName = "ui-stat-value";

export const tableClassName = "ui-table";

export const tableHeadClassName = "ui-table-head";

export const tableHeadRowClassName = "ui-table-head-row";

export const tableHeadCellClassName = "ui-table-head-cell";

export const tableBodyClassName = "ui-table-body";

export const tableCellClassName = "ui-table-cell";

export const tableEmptyCellClassName = "ui-table-empty-cell";

export const pageTitleClassName =
  "text-2xl font-semibold tracking-tight text-zinc-900";

export const pageDescriptionClassName = "mt-1 text-sm text-zinc-600";

export const alertErrorClassName = cn("ui-alert ui-alert-error ui-alert-enter");

export const alertSuccessClassName = cn(
  "ui-alert ui-alert-success ui-alert-enter",
);

export const alertInfoClassName = cn("ui-alert ui-alert-info ui-alert-enter");

export const alertWarningClassName = cn(
  "ui-alert ui-alert-warning ui-alert-enter",
);
