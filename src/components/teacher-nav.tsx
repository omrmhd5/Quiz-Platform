import Link from "next/link";

const links = [
  { href: "/teacher/dashboard", label: "Dashboard" },
  { href: "/teacher/students", label: "Students" },
  { href: "/teacher/quizzes", label: "Quizzes" },
];

type TeacherNavProps = {
  username: string;
  logoutAction: () => Promise<void>;
};

export function TeacherNav({ username, logoutAction }: TeacherNavProps) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Quiz Platform
          </p>
          <p className="text-lg font-semibold text-zinc-900">Teacher Console</p>
        </div>

        <nav className="flex flex-wrap items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-zinc-500 sm:inline">
            Signed in as {username}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
