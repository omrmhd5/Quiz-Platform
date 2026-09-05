"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SectionIntro } from "@/components/section-intro";
import { LiveJoinedCount } from "@/components/sessions/live-joined-count";
import { ActionButton } from "@/components/ui/action-control";
import type { ActiveSessionInfo } from "@/lib/sessions";
import {
  alertErrorClassName,
  alertSuccessClassName,
  alertWarningClassName,
  cn,
  inputClassName,
  labelClassName,
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
  const t = useTranslations("session");
  const tActions = useTranslations("actions");
  const tErrors = useTranslations("errors");
  const isThisQuizLive = activeSession?.quizId === quizId;
  const otherQuizLive =
    activeSession && activeSession.quizId !== quizId ? activeSession : null;

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [copyLabel, setCopyLabel] = useState(tActions("copy"));
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
        t("nowLive", { title: quizTitle }),
      );
      setReplaceDialogOpen(false);
      router.refresh();
    } catch (launchError) {
      setError(
        launchError instanceof Error
          ? launchError.message
          : tErrors("couldNotLaunch"),
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

      setSuccess(t("sessionClosedStudents"));
      router.refresh();
    } catch (closeError) {
      setError(
        closeError instanceof Error
          ? closeError.message
          : tErrors("couldNotClose"),
      );
    } finally {
      setIsClosing(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopyLabel(t("copied"));
      window.setTimeout(() => setCopyLabel(tActions("copy")), 2000);
    } catch {
      setCopyLabel(t("copyFailed"));
      window.setTimeout(() => setCopyLabel(tActions("copy")), 2000);
    }
  }

  return (
    <div className={`${panelClassName} space-y-4`}>
      <SectionIntro
        title={t("launchTitle")}
        description={
          isThisQuizLive
            ? t("studentsCanJoin")
            : t("startLive")
        }
      />

      {otherQuizLive ? (
        <p className={alertWarningClassName}>
          {t("anotherLive", { title: otherQuizLive.quizTitle })}
        </p>
      ) : null}

      {isThisQuizLive ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="ui-live-dot" aria-hidden="true" />
            <span className="text-sm font-medium text-green-800">{t("liveNow")}</span>
            <LiveJoinedCount
              key={activeSession!.sessionId}
              sessionId={activeSession!.sessionId}
              initialCount={joinedCount}
              prefix="· "
              className="text-sm text-zinc-500"
            />
          </div>

          <label htmlFor="join-url" className={labelClassName}>
            {t("joinLink")}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="join-url"
              readOnly
              value={joinUrl}
              className={cn(inputClassName, "font-mono text-xs")}
            />
            <ActionButton
              action="copy"
              onClick={handleCopy}
              className="w-full shrink-0 sm:w-auto"
              label={copyLabel}
            />
          </div>
          <p className="text-xs text-zinc-500">
            {t("shareJoinHint")}
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <ActionButton
              action="view"
              label={t("viewLiveResults")}
              onClick={onViewLiveResults}
              className="w-full justify-center sm:w-auto"
            />
            <ActionButton
              action="close"
              onClick={handleClose}
              disabled={isClosing}
              className="w-full justify-center sm:w-auto"
              label={isClosing ? t("closing") : tActions("close")}
            />
          </div>
        </div>
      ) : (
        <ActionButton
          action="launch"
          disabled={isLaunching}
          className="w-full sm:w-auto"
          onClick={() => {
            if (otherQuizLive) {
              setReplaceDialogOpen(true);
              return;
            }

            void handleLaunch(false);
          }}
          label={isLaunching ? t("launching") : t("launchQuiz")}
        />
      )}

      {error ? (
        <p role="alert" className={alertErrorClassName}>
          {error}
        </p>
      ) : null}

      {success ? <p className={alertSuccessClassName}>{success}</p> : null}

      <ConfirmDialog
        open={replaceDialogOpen}
        title={t("replaceTitle")}
        description={t("replaceDescription", { current: otherQuizLive?.quizTitle ?? quizTitle, next: quizTitle })}
        confirmLabel={isLaunching ? t("launching") : t("launchThis")}
        cancelLabel={tActions("cancel")}
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
