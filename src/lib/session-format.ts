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
    return "bg-green-100 text-green-800";
  }

  if (status === "closed") {
    return "bg-zinc-100 text-zinc-700";
  }

  return "bg-amber-100 text-amber-800";
}
