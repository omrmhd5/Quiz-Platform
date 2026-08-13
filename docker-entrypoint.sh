#!/bin/sh
set -e

echo "Waiting for database..."
until node -e "const postgres=require('postgres'); const sql=postgres(process.env.DATABASE_URL,{max:1}); sql\`SELECT 1\`.then(()=>{sql.end(); process.exit(0)}).catch(()=>process.exit(1));" 2>/dev/null; do
  sleep 2
done

echo "Running migrations..."
npx drizzle-kit migrate

echo "Seeding database..."
npx tsx src/db/seed.ts

echo "Starting application..."
exec node server.js
