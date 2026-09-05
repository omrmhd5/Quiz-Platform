import Link from "next/link";
import { notFound } from "next/navigation";
import { StudentHistoryTable } from "@/components/students/student-history-table";
import { ActionLink } from "@/components/ui/action-control";
import {
  linkClassName,
  pageDescriptionClassName,
  pageTitleClassName,
} from "@/lib/utils";
import { getStudentHistory } from "@/server/actions/student-history";
import { getRequestLocale } from "@/lib/i18n/server";
import { getMessage } from "@/lib/i18n/messages";

type StudentHistoryPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function StudentHistoryPage({
  params,
  searchParams,
}: StudentHistoryPageProps) {
  const { id } = await params;
  const locale = await getRequestLocale();
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? "1");
  const history = await getStudentHistory(
    id,
    Number.isFinite(page) && page > 0 ? page : 1,
  );

  if (!history) {
    notFound();
  }

  return (
    <div id="student-history-page" className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            <Link href="/teacher/students" className={linkClassName}>
              {getMessage(locale, "students.title")}
            </Link>
          </p>
          <h1 className={pageTitleClassName}>{history.studentName}</h1>
          <p className={pageDescriptionClassName}>
            {history.studentId} · {getMessage(locale, "history.registered", { date: history.registeredAt.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }) })} · {getMessage(locale, "history.allSessions")}
          </p>
        </div>
        <ActionLink
          action="back"
          label={getMessage(locale, "history.backToRoster")}
          href="/teacher/students"
          size="md"
        />
      </div>

      <StudentHistoryTable history={history} />
    </div>
  );
}
