import type { AppLocale } from "@/lib/i18n/messages";

export type SessionStatus = "waiting" | "active" | "closed";

export function formatSessionDateTime(
  value: Date | string | null,
  locale: AppLocale = "en",
) {
  if (!value) {
    return "—";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  return date.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function sessionStatusBadgeClass(status: SessionStatus) {
  if (status === "active") {
    return "ui-badge ui-badge-active";
  }

  if (status === "closed") {
    return "ui-badge ui-badge-closed";
  }

  return "ui-badge ui-badge-waiting";
}
