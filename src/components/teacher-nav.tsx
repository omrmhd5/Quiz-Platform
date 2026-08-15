"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActionButton } from "@/components/ui/action-control";
import {
  brandLinkClassName,
  cn,
  navLinkClassName,
  segmentClassName,
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
    <header className="ui-site-header">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/teacher/dashboard" className={brandLinkClassName}>
          <p className="ui-brand-title truncate text-lg font-semibold tracking-tight text-zinc-900">
            Quiz Platform
          </p>
          <p className="text-sm text-zinc-500">Teacher console</p>
        </Link>

        <nav
          aria-label="Teacher sections"
          className={cn(segmentClassName, "w-auto grid-cols-3 sm:grid-flow-col")}>
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
            <ActionButton action="signOut" type="submit" size="md" />
          </form>
        </div>
      </div>
    </header>
  );
}
