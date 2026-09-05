import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseUrl } from "@/lib/db-url";
import * as relations from "./relations";
import * as schema from "./schema";

const fullSchema = { ...schema, ...relations };

type Db = PostgresJsDatabase<typeof fullSchema>;

declare global {
  var __quizPlatformDb: Db | undefined;
  var __quizPlatformClient: ReturnType<typeof postgres> | undefined;
}

function isServerlessRuntime() {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

function createDb() {
  const connectionString = getDatabaseUrl();
  const needsSsl =
    process.env.NODE_ENV === "production" ||
    /neon\.tech|render\.com|sslmode=require/i.test(connectionString);
  const serverless = isServerlessRuntime();

  const client = postgres(connectionString, {
    max: serverless ? 1 : 10,
    idle_timeout: serverless ? 20 : 0,
    connect_timeout: 10,
    ...(needsSsl ? { ssl: "require" } : {}),
  });
  const database = drizzle(client, { schema: fullSchema });

  global.__quizPlatformClient = client;
  global.__quizPlatformDb = database;

  return { client, database };
}

function getDb() {
  if (!global.__quizPlatformDb) {
    createDb();
  }

  return global.__quizPlatformDb!;
}

export const db = new Proxy({} as Db, {
  get(_target, property, receiver) {
    return Reflect.get(getDb(), property, receiver);
  },
});

export type Database = Db;
