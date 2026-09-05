"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { students } from "@/db/schema";
import { tMsg, tServer } from "@/lib/i18n/server";
import {
  parseBulkImport,
  validateStudentId,
  validateStudentName,
  type StudentActionState,
} from "@/lib/students";

async function flattenImportError(message: {
  key: string;
  values?: Record<string, string | number>;
}) {
  const values = { ...message.values };
  if (typeof values.detail === "string" && values.detail.startsWith("errors.")) {
    values.detail = await tServer(values.detail);
  }
  return tServer(message.key, values);
}

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
    return { error: await tMsg(idError) };
  }

  const nameError = validateStudentName(name);
  if (nameError) {
    return { error: await tMsg(nameError) };
  }

  const [existing] = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.id, id))
    .limit(1);

  if (existing) {
    return { error: await tServer("errors.studentIdTaken", { id }) };
  }

  await db.insert(students).values({ id, name });

  revalidatePath("/teacher/students");
  return { success: await tServer("success.studentAdded", { name }) };
}

export async function updateStudent(
  studentId: string,
  _prevState: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const nameError = validateStudentName(name);

  if (nameError) {
    return { error: await tMsg(nameError) };
  }

  const [existing] = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);

  if (!existing) {
    return { error: await tServer("errors.studentNotFound") };
  }

  await db.update(students).set({ name }).where(eq(students.id, studentId));

  revalidatePath("/teacher/students");
  return { success: await tServer("success.studentUpdated") };
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
    return { error: await tServer("errors.pasteStudents") };
  }

  const { rows, errors } = parseBulkImport(bulk);

  if (errors.length > 0) {
    const translated = await Promise.all(
      errors.slice(0, 5).map((error) => flattenImportError(error)),
    );
    return { error: translated.join(" ") };
  }

  if (rows.length === 0) {
    return { error: await tServer("errors.noValidStudents") };
  }

  const existing = await db.select({ id: students.id }).from(students);
  const existingIds = new Set(existing.map((student) => student.id));

  const duplicateIds = rows
    .filter((row) => existingIds.has(row.id))
    .map((row) => row.id);

  if (duplicateIds.length > 0) {
    return {
      error: await tServer("errors.idsExist", {
        ids: duplicateIds.slice(0, 5).join(", "),
      }),
    };
  }

  await db.insert(students).values(
    rows.map((row) => ({
      id: row.id,
      name: row.name,
    })),
  );

  revalidatePath("/teacher/students");
  return {
    success: await tServer("success.studentsImported", { count: rows.length }),
  };
}
