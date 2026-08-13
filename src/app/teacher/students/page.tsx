import { AddStudentForm } from "@/components/students/add-student-form";
import { ImportStudentsForm } from "@/components/students/import-students-form";
import { StudentsTable } from "@/components/students/students-table";
import { getStudents } from "@/server/actions/students";

export default async function StudentsPage() {
  const studentRows = await getStudents();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Students</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage your student roster by ID and name.
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
