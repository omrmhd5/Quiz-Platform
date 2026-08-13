"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  brandLinkClassName,
  buttonGhostClassName,
  cn,
  navLinkClassName,
} from "@/lib/utils";

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
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/teacher/dashboard" className={brandLinkClassName}>
          <p className="ui-brand-title truncate text-lg font-semibold tracking-tight text-zinc-900">
            Quiz Platform
          </p>
          <p className="text-sm text-zinc-500">Teacher console</p>
        </Link>

        <nav
          aria-label="Teacher sections"
          className="flex flex-wrap items-center gap-1 rounded-lg bg-zinc-100/90 p-1">
          {links.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(navLinkClassName, isActive && "is-active")}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-zinc-600 sm:inline">
            {username}
          </span>
          <form action={logoutAction}>
            <button type="submit" className={buttonGhostClassName}>
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
