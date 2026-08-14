"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { LiveJoinedCount } from "@/components/sessions/live-joined-count";
import type { ActiveSessionInfo } from "@/lib/sessions";
import {
  alertErrorClassName,
  alertSuccessClassName,
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  cn,
  inputClassName,
  panelClassName,
} from "@/lib/utils";
import { closeQuizSession, launchQuizSession } from "@/server/actions/sessions";

type LaunchQuizPanelProps = {
  quizId: string;
  quizTitle: string;
  joinUrl: string;
  activeSession: ActiveSessionInfo | null;
  joinedCount: number;
  onViewLiveResults?: () => void;
};

export function LaunchQuizPanel({
  quizId,
  quizTitle,
  joinUrl,
  activeSession,
  joinedCount,
  onViewLiveResults,
}: LaunchQuizPanelProps) {
  const isThisQuizLive = activeSession?.quizId === quizId;
  const otherQuizLive =
    activeSession && activeSession.quizId !== quizId ? activeSession : null;

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy link");
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
  const router = useRouter();

  async function handleLaunch(replaceActive: boolean) {
    setIsLaunching(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await launchQuizSession(quizId, replaceActive);

      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }

      setSuccess(
        `"${quizTitle}" is now live. Share the join link with students.`,
      );
      setReplaceDialogOpen(false);
      router.refresh();
    } catch (launchError) {
      setError(
        launchError instanceof Error
          ? launchError.message
          : "Could not launch quiz.",
      );
    } finally {
      setIsLaunching(false);
    }
  }

  async function handleClose() {
    if (!activeSession || !isThisQuizLive) {
      return;
    }

    setIsClosing(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await closeQuizSession(activeSession.sessionId);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess("Quiz session closed. Students can no longer join.");
      router.refresh();
    } catch (closeError) {
      setError(
        closeError instanceof Error
          ? closeError.message
          : "Could not close session.",
      );
    } finally {
      setIsClosing(false);
    }
  }

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

  return (
    <div className={`${panelClassName} space-y-4`}>
      <div>
        <h2 className="text-base font-semibold text-zinc-900">Launch quiz</h2>
        <p className="mt-1 text-sm text-zinc-600">
          {isThisQuizLive
            ? "Students can join using the link below."
            : "Start a live session so students can join from their devices."}
        </p>
      </div>

      {otherQuizLive ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Another quiz is live: <strong>{otherQuizLive.quizTitle}</strong>.
          Launching this quiz will close that session.
        </p>
      ) : null}

      {isThisQuizLive ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            <span className="text-sm font-medium text-green-800">Live now</span>
            <LiveJoinedCount
              key={activeSession!.sessionId}
              sessionId={activeSession!.sessionId}
              initialCount={joinedCount}
              prefix="· "
              className="text-sm text-zinc-500"
            />
          </div>

          <label
            htmlFor="join-url"
            className="block text-sm font-medium text-zinc-700">
            Student join link
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="join-url"
              readOnly
              value={joinUrl}
              className={cn(inputClassName, "font-mono text-xs")}
            />
            <button
              type="button"
              onClick={handleCopy}
              className={cn(buttonSecondaryClassName, "shrink-0")}>
              {copyLabel}
            </button>
          </div>
          <p className="text-xs text-zinc-500">
            Share this URL on your classroom network. Students open it on their
            phone or tablet and enter their ID.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onViewLiveResults}
              className={cn(buttonSecondaryClassName, "ui-btn-sm")}>
              View live results
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isClosing}
              className={buttonSecondaryClassName}>
              {isClosing ? "Closing..." : "Close session"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={isLaunching}
          onClick={() => {
            if (otherQuizLive) {
              setReplaceDialogOpen(true);
              return;
            }

            void handleLaunch(false);
          }}
          className={buttonPrimaryClassName}>
          {isLaunching ? "Launching..." : "Launch quiz"}
        </button>
      )}

      {error ? (
        <p role="alert" className={alertErrorClassName}>
          {error}
        </p>
      ) : null}

      {success ? <p className={alertSuccessClassName}>{success}</p> : null}

      <ConfirmDialog
        open={replaceDialogOpen}
        title="Replace live quiz?"
        description={`"${otherQuizLive?.quizTitle ?? "The current quiz"}" is live. Launching "${quizTitle}" will close that session.`}
        confirmLabel={isLaunching ? "Launching..." : "Launch this quiz"}
        cancelLabel="Cancel"
        variant="danger"
        isPending={isLaunching}
        onConfirm={() => handleLaunch(true)}
        onCancel={() => {
          if (!isLaunching) {
            setReplaceDialogOpen(false);
          }
        }}
      />
    </div>
  );
}
