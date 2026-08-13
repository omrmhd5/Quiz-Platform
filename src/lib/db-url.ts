import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env");

  if (!existsSync(envPath)) {
    return;
  }

  const contents = readFileSync(envPath, "utf8");

  for (const line of contents.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function getDatabaseUrl() {
  loadEnvFile();

  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const user = process.env.POSTGRES_USER ?? "quiz";
  const password = process.env.POSTGRES_PASSWORD ?? "quizpassword";
  const db = process.env.POSTGRES_DB ?? "quiz_platform";
  const port = process.env.POSTGRES_PORT ?? "5432";
  const host = process.env.POSTGRES_HOST ?? "localhost";

  return `postgresql://${user}:${password}@${host}:${port}/${db}`;
}
