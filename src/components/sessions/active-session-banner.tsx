"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LiveJoinedCount } from "@/components/sessions/live-joined-count";
import type { ActiveSessionInfo } from "@/lib/sessions";
import {
  buttonSecondaryClassName,
  cn,
  inputClassName,
  panelClassName,
} from "@/lib/utils";
import { closeQuizSession } from "@/server/actions/sessions";

type ActiveSessionBannerProps = {
  activeSession: ActiveSessionInfo;
  joinUrl: string;
  joinedCount: number;
};

export function ActiveSessionBanner({
  activeSession,
  joinUrl,
  joinedCount,
}: ActiveSessionBannerProps) {
  const router = useRouter();
  const [copyLabel, setCopyLabel] = useState("Copy link");
  const [isClosing, setIsClosing] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopyLabel("Copied!");
      window.setTimeout(() => setCopyLabel("Copy link"), 2000);
    } catch {
      setCopyLabel("Copy failed");
      window.setTimeout(() => setCopyLabel("Copy link"), 2000);
    }
  }

  async function handleClose() {
    setIsClosing(true);

    try {
      await closeQuizSession(activeSession.sessionId);
      router.refresh();
    } finally {
      setIsClosing(false);
    }
  }

  return (
    <div
      className={cn(
        panelClassName,
        "border-green-200 bg-green-50/80 space-y-4",
      )}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            <span className="text-sm font-medium text-green-900">
              Live quiz running
            </span>
          </div>
          <p className="text-base font-semibold text-zinc-900">
            <Link
              href={`/teacher/quizzes/${activeSession.quizId}`}
              className="underline decoration-green-300 underline-offset-2 hover:decoration-green-500">
              {activeSession.quizTitle}
            </Link>
          </p>
          <LiveJoinedCount
            key={activeSession.sessionId}
            sessionId={activeSession.sessionId}
            initialCount={joinedCount}
            className="text-sm text-zinc-600"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/teacher/quizzes/${activeSession.quizId}#session-${activeSession.sessionId}`}
            className={cn(buttonSecondaryClassName, "ui-btn-sm")}>
            View live results
          </Link>
          <button
            type="button"
            onClick={handleClose}
            disabled={isClosing}
            className={cn(buttonSecondaryClassName, "ui-btn-sm")}>
            {isClosing ? "Closing..." : "Close session"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={joinUrl}
          aria-label="Student join link"
          className={cn(inputClassName, "font-mono text-xs")}
        />
        <button
          type="button"
          onClick={handleCopy}
          className={cn(buttonSecondaryClassName, "ui-btn-sm shrink-0")}>
          {copyLabel}
        </button>
      </div>
    </div>
  );
}
