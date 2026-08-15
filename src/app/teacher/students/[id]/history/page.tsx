import Link from "next/link";
import { notFound } from "next/navigation";
import { StudentHistoryTable } from "@/components/students/student-history-table";
import {
  buttonSecondaryClassName,
  cn,
  linkClassName,
  pageDescriptionClassName,
  pageTitleClassName,
} from "@/lib/utils";
import { getStudentHistory } from "@/server/actions/student-history";

type StudentHistoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function StudentHistoryPage({
  params,
}: StudentHistoryPageProps) {
  const { id } = await params;
  const history = await getStudentHistory(id);

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
        <Link
          href="/teacher/students"
          className={cn(buttonSecondaryClassName, "inline-flex items-center")}>
          Back to roster
        </Link>
      </div>

      <StudentHistoryTable history={history} />
    </div>
  );
}
