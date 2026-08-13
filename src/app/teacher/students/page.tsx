export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Students</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage your student roster by ID and name.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center">
        <p className="text-sm text-zinc-500">
          Student management will be available in the next increment.
        </p>
      </div>
    </div>
  );
}
