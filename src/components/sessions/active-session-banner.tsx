"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LiveJoinedCount } from "@/components/sessions/live-joined-count";
import { ActionButton, ActionLink } from "@/components/ui/action-control";
import type { ActiveSessionInfo } from "@/lib/sessions";
import {
  cn,
  inputClassName,
  linkClassName,
  liveBannerClassName,
} from "@/lib/utils";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("session");
  const tActions = useTranslations("actions");
  const router = useRouter();
  const [copyLabel, setCopyLabel] = useState(tActions("copy"));
  const [isClosing, setIsClosing] = useState(false);

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
    <div className={cn(liveBannerClassName, "space-y-4")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="ui-live-dot" aria-hidden="true" />
            <span className="text-sm font-medium text-green-900">
              {t("launchTitle")}
            </span>
          </div>
          <p className="text-base font-semibold text-zinc-900">
            <Link
              href={`/teacher/quizzes/${activeSession.quizId}`}
              className={linkClassName}>
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

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <ActionLink
            action="view"
            label={t("viewLiveResults")}
            href={`/teacher/quizzes/${activeSession.quizId}#session-${activeSession.sessionId}`}
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

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={joinUrl}
          aria-label={t("joinLink")}
          className={cn(inputClassName, "font-mono text-xs")}
        />
        <ActionButton
          action="copy"
          onClick={handleCopy}
          className="ui-btn-sm w-full shrink-0 sm:w-auto"
          label={copyLabel}
        />
      </div>
    </div>
  );
}
