"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getActiveSessionAttemptCount } from "@/server/actions/sessions";

type LiveJoinedCountProps = {
  sessionId: string;
  initialCount: number;
  className?: string;
  prefix?: string;
};

export function LiveJoinedCount({
  sessionId,
  initialCount,
  className,
  prefix = "",
}: LiveJoinedCountProps) {
  const t = useTranslations("session");
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const nextCount = await getActiveSessionAttemptCount(sessionId);
        if (!cancelled) {
          setCount(nextCount);
        }
      } catch {
        // Ignore transient poll errors; next interval will retry.
      }
    }

    void poll();

    const intervalId = window.setInterval(() => {
      void poll();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [sessionId]);

  return (
    <span className={className}>
      {prefix}
      {t("studentsJoined", { count })}
    </span>
  );
}
