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

type StudentHistoryPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function StudentHistoryPage({
  params,
  searchParams,
}: StudentHistoryPageProps) {
  const { id } = await params;
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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            <Link href="/teacher/students" className={linkClassName}>
              Students
            </Link>
          </p>
          <h1 className={pageTitleClassName}>{history.studentName}</h1>
          <p className={pageDescriptionClassName}>
            ID {history.studentId} · Registered{" "}
            {history.registeredAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            · quiz history across all sessions
          </p>
        </div>
        <ActionLink
          action="back"
          label="Back to roster"
          href="/teacher/students"
          size="md"
        />
      </div>

      <StudentHistoryTable history={history} />
    </div>
  );
}
