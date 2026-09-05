"use client";

import { useTranslations } from "next-intl";
import { panelClassName } from "@/lib/utils";

export const DEMO_TEACHER = {
  username: "teacher",
  password: "teacher123",
};

export function DemoLoginCard() {
  const t = useTranslations("login");
  const tBanner = useTranslations("banner");

  return (
    <aside className={`${panelClassName} mt-6 space-y-3 p-4 sm:p-5`}>
      <div>
        <h2 className="text-sm font-semibold text-zinc-900">{t("demoHeading")}</h2>
        <p className="mt-1 text-xs text-zinc-500">{t("copyHint")}</p>
      </div>
      <dl className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 text-sm">
        <dt className="text-zinc-500">{t("demoRole")}</dt>
        <dd className="select-all font-mono text-zinc-900">{DEMO_TEACHER.username}</dd>
        <dd className="select-all font-mono text-zinc-900">{DEMO_TEACHER.password}</dd>
      </dl>
      <p className="text-xs text-zinc-500">{tBanner("wake")}</p>
    </aside>
  );
}
