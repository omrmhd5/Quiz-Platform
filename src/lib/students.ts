import { msg, type TMsg } from "@/lib/i18n/messages";

export const STUDENT_ID_PATTERN = /^[a-zA-Z0-9]+$/;

export function validateStudentId(id: string): TMsg | null {
  const trimmed = id.trim();

  if (!trimmed) {
    return msg("errors.studentIdRequired");
  }

  if (trimmed.length > 32) {
    return msg("errors.studentIdTooLong");
  }

  if (!STUDENT_ID_PATTERN.test(trimmed)) {
    return msg("errors.studentIdCharset");
  }

  return null;
}

export function validateStudentName(name: string): TMsg | null {
  const trimmed = name.trim();

  if (!trimmed) {
    return msg("errors.nameRequired");
  }

  if (trimmed.length > 100) {
    return msg("errors.nameTooLong");
  }

  return null;
}

export type ParsedStudentRow = {
  id: string;
  name: string;
  line: number;
};

export type StudentActionState = {
  error?: string;
  success?: string;
};

export const studentActionInitialState: StudentActionState = {};

export function parseBulkImport(text: string): {
  rows: ParsedStudentRow[];
  errors: TMsg[];
} {
  const lines = text.split(/\r?\n/);
  const rows: ParsedStudentRow[] = [];
  const errors: TMsg[] = [];
  const seenIds = new Set<string>();

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return;
    }

    const commaIndex = trimmedLine.indexOf(",");

    if (commaIndex === -1) {
      errors.push(msg("errors.importLineFormat", { line: lineNumber }));
      return;
    }

    const id = trimmedLine.slice(0, commaIndex).trim();
    const name = trimmedLine.slice(commaIndex + 1).trim();

    const idError = validateStudentId(id);
    if (idError) {
      errors.push({
        key: "errors.importLineError",
        values: { line: lineNumber, detail: idError.key },
      });
      return;
    }

    const nameError = validateStudentName(name);
    if (nameError) {
      errors.push({
        key: "errors.importLineError",
        values: { line: lineNumber, detail: nameError.key },
      });
      return;
    }

    if (seenIds.has(id)) {
      errors.push(
        msg("errors.importDuplicate", { line: lineNumber, id }),
      );
      return;
    }

    seenIds.add(id);
    rows.push({ id, name, line: lineNumber });
  });

  return { rows, errors };
}
