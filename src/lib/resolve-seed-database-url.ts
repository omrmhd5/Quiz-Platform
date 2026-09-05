import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const separatorIndex = trimmed.indexOf("=");
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function maskDatabaseUrl(url: string) {
  return url.replace(/:([^:@/]+)@/, ":***@");
}

export function buildLocalDatabaseUrl() {
  loadEnvFile(resolve(process.cwd(), ".env"));
  loadEnvFile(resolve(process.cwd(), ".env.local"));

  const user = process.env.POSTGRES_USER ?? "quiz";
  const password = process.env.POSTGRES_PASSWORD ?? "quizpassword";
  const db = process.env.POSTGRES_DB ?? "quiz_platform";
  const port = process.env.POSTGRES_PORT ?? "5433";
  const host = process.env.POSTGRES_HOST ?? "localhost";

  return `postgresql://${user}:${password}@${host}:${port}/${db}`;
}

function loadNeonEnv() {
  const neonPath = resolve(process.cwd(), ".env.neon.local");
  if (!existsSync(neonPath)) return false;

  for (const line of readFileSync(neonPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const separatorIndex = trimmed.indexOf("=");
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key) process.env[key] = value;
  }

  return Boolean(process.env.DATABASE_URL);
}

async function probeConnection(connectionString: string) {
  const needsSsl = /neon\.tech|sslmode=require|render\.com/i.test(
    connectionString,
  );
  const client = postgres(connectionString, {
    max: 1,
    connect_timeout: 3,
    ...(needsSsl ? { ssl: "require" } : {}),
  });

  try {
    await client`select 1`;
    return true;
  } catch {
    return false;
  } finally {
    await client.end({ timeout: 1 }).catch(() => {});
  }
}

export async function resolveSeedDatabaseUrl() {
  if (process.env.VERCEL === "1" && process.env.DATABASE_URL) {
    console.log(`Demo seed: Vercel → Neon (${maskDatabaseUrl(process.env.DATABASE_URL)})`);
    return process.env.DATABASE_URL;
  }

  if (process.env.LOCAL_DEMO_SEED === "1") {
    const localUrl = buildLocalDatabaseUrl();
    console.log(`Demo seed: forced local (${maskDatabaseUrl(localUrl)})`);
    return localUrl;
  }

  const localUrl = buildLocalDatabaseUrl();
  if (await probeConnection(localUrl)) {
    console.log(`Demo seed: local Postgres (${maskDatabaseUrl(localUrl)})`);
    return localUrl;
  }

  if (loadNeonEnv() && process.env.DATABASE_URL) {
    console.log(`Demo seed: Neon (${maskDatabaseUrl(process.env.DATABASE_URL)})`);
    return process.env.DATABASE_URL;
  }

  if (process.env.DATABASE_URL) {
    console.log(`Demo seed: DATABASE_URL (${maskDatabaseUrl(process.env.DATABASE_URL)})`);
    return process.env.DATABASE_URL;
  }

  throw new Error(
    "No database for demo seed. Start local Docker (npm run docker) or configure .env.neon.local / DATABASE_URL.",
  );
}
