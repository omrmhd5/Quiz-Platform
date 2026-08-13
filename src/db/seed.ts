import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseUrl } from "@/lib/db-url";
import { teachers } from "./schema";

async function seed() {
  const connectionString = getDatabaseUrl();

  const username = process.env.TEACHER_USERNAME ?? "admin";
  const password = process.env.TEACHER_PASSWORD ?? "admin123";
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  const [existing] = await db
    .select()
    .from(teachers)
    .where(eq(teachers.username, username))
    .limit(1);

  if (existing) {
    console.log(`Teacher "${username}" already exists. Skipping seed.`);
    await client.end();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(teachers).values({
    username,
    passwordHash,
  });

  console.log(`Seeded teacher account: ${username}`);
  await client.end();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
