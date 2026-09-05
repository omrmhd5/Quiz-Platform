"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/ui/action-control";
import { LanguageSwitch } from "@/components/language-switch";
import {
  brandLinkClassName,
  cn,
  navLinkClassName,
  segmentClassName,
} from "@/lib/utils";

const links = [
  { href: "/teacher/dashboard", key: "dashboard" as const },
  { href: "/teacher/students", key: "students" as const },
  { href: "/teacher/quizzes", key: "quizzes" as const },
];

type TeacherNavProps = {
  username: string;
  logoutAction: () => Promise<void>;
};

export function TeacherNav({ username, logoutAction }: TeacherNavProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <header className="ui-site-header">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <Link href="/teacher/dashboard" className={cn(brandLinkClassName, "min-w-0")}>
            <p className="ui-brand-title truncate text-lg font-semibold tracking-tight text-zinc-900">
              {t("brand")}
            </p>
            <p className="truncate text-sm text-zinc-500">{t("console")}</p>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitch />
            <span className="max-w-[7rem] truncate text-sm text-zinc-600 sm:max-w-none">
              {username}
            </span>
            <form action={logoutAction}>
              <ActionButton action="signOut" type="submit" size="md" compact />
            </form>
          </div>
        </div>

        <nav
          aria-label={t("sections")}
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
                {t(link.key)}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
