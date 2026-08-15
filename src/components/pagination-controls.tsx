"use client";



import { ActionButton } from "@/components/ui/action-control";

import { cn } from "@/lib/utils";



type PaginationControlsProps = {

  page: number;

  pageCount: number;

  totalItems: number;

  pageSize: number;

  onPageChange: (page: number) => void;

  className?: string;

  label?: string;

};



export function PaginationControls({

  page,

  pageCount,

  totalItems,

  pageSize,

  onPageChange,

  className,

  label = "Pagination",

}: PaginationControlsProps) {

  if (totalItems <= pageSize) {

    return null;

  }



  const start = (page - 1) * pageSize + 1;

  const end = Math.min(page * pageSize, totalItems);



  return (

    <nav

      aria-label={label}

      className={cn(

        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",

        className,

      )}>

      <p className="text-sm text-zinc-600">

        Showing {start}–{end} of {totalItems}

      </p>

      <div className="flex items-center gap-2">

        <ActionButton

          action="previous"

          disabled={page <= 1}

          onClick={() => onPageChange(page - 1)}

          className="min-h-11 min-w-11"

        />

        <span

          className="text-sm tabular-nums text-zinc-600"

          aria-current="page">

          Page {page} of {pageCount}

        </span>

        <ActionButton

          action="next"

          disabled={page >= pageCount}

          onClick={() => onPageChange(page + 1)}

          className="min-h-11 min-w-11"

        />

      </div>

    </nav>

  );

}


