"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitch } from "@/components/language-switch";

export function DemoBanner() {
  const t = useTranslations("banner");

  return (
    <div className="sticky top-0 z-[80] flex items-center justify-between gap-3 bg-amber-400 px-4 py-2 text-zinc-950">
      <p className="text-center text-xs font-extrabold tracking-wide uppercase sm:text-sm">
        {t("demo")}
      </p>
      <LanguageSwitch className="shrink-0 bg-zinc-950/10 hover:bg-zinc-950/15" />
    </div>
  );
}
