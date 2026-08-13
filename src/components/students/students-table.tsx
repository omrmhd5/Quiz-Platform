"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { StudentActionState } from "@/lib/students";
import { deleteStudent, updateStudent } from "@/server/actions/students";

type Student = {
  id: string;
  name: string;
  createdAt: Date;
};

type StudentsTableProps = {
  students: Student[];
};

export function StudentsTable({ students }: StudentsTableProps) {
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return students;
    }

    return students.filter(
      (student) =>
        student.id.toLowerCase().includes(normalizedQuery) ||
        student.name.toLowerCase().includes(normalizedQuery),
    );
  }, [query, students]);

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            Student roster
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {students.length} registered · {filteredStudents.length} shown
          </p>
        </div>

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by ID or name"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900 focus:ring-2 sm:max-w-xs"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500">
          {students.length === 0
            ? "No students yet. Add one above or import a list."
            : "No students match your search."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredStudents.map((student) =>
                editingId === student.id ? (
                  <EditStudentRow
                    key={student.id}
                    student={student}
                    onCancel={() => setEditingId(null)}
                    onSaved={() => setEditingId(null)}
                  />
                ) : (
                  <tr key={student.id}>
                    <td className="px-3 py-3 font-mono text-zinc-900">
                      {student.id}
                    </td>
                    <td className="px-3 py-3 text-zinc-900">{student.name}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(student.id)}
                          className="rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
                          Edit
                        </button>
                        <DeleteStudentButton studentId={student.id} />
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EditStudentRow({
  student,
  onCancel,
  onSaved,
}: {
  student: Student;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const boundUpdate = updateStudent.bind(null, student.id);
  const [state, formAction, isPending] = useActionState<
    StudentActionState,
    FormData
  >(boundUpdate, {});

  useEffect(() => {
    if (state.success) {
      onSaved();
    }
  }, [state.success, onSaved]);

  return (
    <tr>
      <td className="px-3 py-3 font-mono text-zinc-900">{student.id}</td>
      <td className="px-3 py-3" colSpan={2}>
        <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
          <input
            name="name"
            type="text"
            defaultValue={student.name}
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900 focus:ring-2"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-70">
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
              Cancel
            </button>
          </div>
          {state.error ? (
            <p className="text-xs text-red-600 sm:basis-full">{state.error}</p>
          ) : null}
        </form>
      </td>
    </tr>
  );
}

function DeleteStudentButton({ studentId }: { studentId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete student ${studentId}? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteStudent(studentId);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-70">
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
