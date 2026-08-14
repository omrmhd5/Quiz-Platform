"use client";

import { buttonSecondaryClassName, cn } from "@/lib/utils";

type PaginationControlsProps = {
  page: number;
  pageCount: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function PaginationControls({
  page,
  pageCount,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: PaginationControlsProps) {
  if (totalItems <= pageSize) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}>
      <p className="text-sm text-zinc-600">
        Showing {start}–{end} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(buttonSecondaryClassName, "ui-btn-sm")}>
          Previous
        </button>
        <span className="text-sm tabular-nums text-zinc-600">
          Page {page} of {pageCount}
        </span>
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className={cn(buttonSecondaryClassName, "ui-btn-sm")}>
          Next
        </button>
      </div>
    </div>
  );
}
