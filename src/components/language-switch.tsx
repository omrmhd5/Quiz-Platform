"use client";

import { useTranslations } from "next-intl";
import { useAppLocale } from "@/components/providers/locale-provider";
import { buttonGhostClassName, cn } from "@/lib/utils";

export function LanguageSwitch({ className }: { className?: string }) {
  const t = useTranslations("language");
  const { locale, setLocale } = useAppLocale();
  const next = locale === "en" ? "ar" : "en";

  return (
    <button
      type="button"
      className={cn(buttonGhostClassName, "min-h-9 px-2.5 text-xs", className)}
      aria-label={t("toggle")}
      onClick={() => setLocale(next)}>
      {locale === "en" ? t("ar") : t("en")}
    </button>
  );
}
