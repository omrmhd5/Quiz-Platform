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

function createDb() {
  const connectionString = getDatabaseUrl();

  const client = postgres(connectionString, { max: 10 });
  const database = drizzle(client, { schema: fullSchema });

  if (process.env.NODE_ENV !== "production") {
    global.__quizPlatformClient = client;
    global.__quizPlatformDb = database;
  }

  return { client, database };
}

function getDb() {
  if (global.__quizPlatformDb) {
    return global.__quizPlatformDb;
  }

  return createDb().database;
}

export const db = new Proxy({} as Db, {
  get(_target, property, receiver) {
    return Reflect.get(getDb(), property, receiver);
  },
});

export type Database = Db;
