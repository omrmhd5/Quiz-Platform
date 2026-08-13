export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
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
          <div
            key={label}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">—</p>
          </div>
        ))}
      </div>
    </div>
  );
}
