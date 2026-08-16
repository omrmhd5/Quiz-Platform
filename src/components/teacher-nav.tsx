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
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <Link href="/teacher/dashboard" className={cn(brandLinkClassName, "min-w-0")}>
            <p className="ui-brand-title truncate text-lg font-semibold tracking-tight text-zinc-900">
              Quiz Platform
            </p>
            <p className="truncate text-sm text-zinc-500">Teacher console</p>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="max-w-[7rem] truncate text-sm text-zinc-600 sm:max-w-none">
              {username}
            </span>
            <form action={logoutAction}>
              <ActionButton action="signOut" type="submit" size="md" compact />
            </form>
          </div>
        </div>

        <nav
          aria-label="Teacher sections"
          className={cn(segmentClassName, "grid w-full grid-cols-3")}>
          {links.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  navLinkClassName,
                  "w-full justify-center text-center",
                  isActive && "is-active",
                )}>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
