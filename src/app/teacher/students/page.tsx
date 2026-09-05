import { AddStudentForm } from "@/components/students/add-student-form";
import { ImportStudentsForm } from "@/components/students/import-students-form";
import { StudentsTable } from "@/components/students/students-table";
import { getMessage } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";
import { pageDescriptionClassName, pageTitleClassName } from "@/lib/utils";
import { getStudents } from "@/server/actions/students";

export default async function StudentsPage() {
  const [studentRows, locale] = await Promise.all([
    getStudents(),
    getRequestLocale(),
  ]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className={pageTitleClassName}>
          {getMessage(locale, "students.title")}
        </h1>
        <p className={pageDescriptionClassName}>
          {getMessage(locale, "students.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AddStudentForm />
        <ImportStudentsForm />
      </div>

      <StudentsTable students={studentRows} />
    </div>
  );
}
