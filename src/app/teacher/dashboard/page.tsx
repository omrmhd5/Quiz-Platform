import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getJoinUrl } from "@/lib/join-url";
import { getDashboardStats } from "@/server/actions/dashboard";
import { getActiveSession } from "@/server/actions/sessions";

export default async function DashboardPage() {
  const [stats, activeSession, joinUrl] = await Promise.all([
    getDashboardStats(),
    getActiveSession(),
    getJoinUrl(),
  ]);

  return (
    <DashboardView
      stats={stats}
      activeSession={activeSession}
      joinUrl={joinUrl}
      joinedCount={activeSession?.joinedCount ?? 0}
    />
  );
}
