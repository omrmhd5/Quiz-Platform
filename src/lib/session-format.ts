export type SessionStatus = "waiting" | "active" | "closed";

export function formatSessionDateTime(value: Date | string | null) {
  if (!value) {
    return "—";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  return date.toLocaleString("en-US", {
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
