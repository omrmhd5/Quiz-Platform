"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { students } from "@/db/schema";
import {
  parseBulkImport,
  validateStudentId,
  validateStudentName,
  type StudentActionState,
} from "@/lib/students";

export async function getStudents() {
  return db.select().from(students).orderBy(asc(students.id));
}

export async function createStudent(
  _prevState: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  const idError = validateStudentId(id);
  if (idError) {
    return { error: idError };
  }

  const nameError = validateStudentName(name);
  if (nameError) {
    return { error: nameError };
  }

  const [existing] = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.id, id))
    .limit(1);

  if (existing) {
    return { error: `Student ID "${id}" is already registered.` };
  }

  await db.insert(students).values({ id, name });

  revalidatePath("/teacher/students");
  return { success: `Student "${name}" added.` };
}

export async function updateStudent(
  studentId: string,
  _prevState: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const nameError = validateStudentName(name);

  if (nameError) {
    return { error: nameError };
  }

  const [existing] = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);

  if (!existing) {
    return { error: "Student not found." };
  }

  await db.update(students).set({ name }).where(eq(students.id, studentId));

  revalidatePath("/teacher/students");
  return { success: "Student updated." };
}

export async function deleteStudent(studentId: string) {
  await db.delete(students).where(eq(students.id, studentId));
  revalidatePath("/teacher/students");
}

export async function importStudents(
  _prevState: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const bulk = String(formData.get("bulk") ?? "");

  if (!bulk.trim()) {
    return { error: "Paste at least one student line." };
  }

  const { rows, errors } = parseBulkImport(bulk);

  if (errors.length > 0) {
    return { error: errors.slice(0, 5).join(" ") };
  }

  if (rows.length === 0) {
    return { error: "No valid students found in import." };
  }

  const existing = await db.select({ id: students.id }).from(students);
  const existingIds = new Set(existing.map((student) => student.id));

  const duplicateIds = rows
    .filter((row) => existingIds.has(row.id))
    .map((row) => row.id);

  if (duplicateIds.length > 0) {
    return {
      error: `These IDs already exist: ${duplicateIds.slice(0, 5).join(", ")}.`,
    };
  }

  await db.insert(students).values(
    rows.map((row) => ({
      id: row.id,
      name: row.name,
    })),
  );

  revalidatePath("/teacher/students");
  return { success: `${rows.length} students imported.` };
}
