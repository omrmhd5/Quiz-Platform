import {
  pageDescriptionClassName,
  pageTitleClassName,
  statCardClassName,
} from "@/lib/utils";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className={pageTitleClassName}>Dashboard</h1>
        <p className={pageDescriptionClassName}>
          General stats and recent activity will appear here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          "Registered students",
          "Quizzes created",
          "Sessions run",
          "Overall average score",
        ].map((label) => (
          <div key={label} className={statCardClassName}>
            <p className="text-sm text-zinc-600">{label}</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-300">
              0
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
