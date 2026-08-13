# Quiz Platform

Local-network quiz platform for classroom use. One teacher runs the app on their device; students join from phones or tablets on the same Wi‑Fi using their student ID.

## Stack

- Next.js 16 (App Router)
- PostgreSQL 18
- Drizzle ORM
- Docker Compose

## Quick start (Docker)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Start the platform:

**First time, or after changing code / Dockerfile:**

```bash
docker compose up --build
# or
npm run docker:build
```

**Normal daily use (faster — reuses existing image):**

```bash
docker compose up
# or
npm run docker
```

Stop with `Ctrl+C`, then optionally:

```bash
npm run docker:down
```

### What runs on every start

When the web container starts, it automatically:

1. Waits for PostgreSQL to be ready
2. Runs database migrations
3. Seeds the default teacher (skipped if `admin` already exists)
4. Starts the app on port **3000** (or `APP_PORT` from `.env`)

Open the teacher console:

```
http://localhost:3000/login
```

Default credentials (change in `.env` before first run):

- **Username:** `admin`
- **Password:** `admin123`

## LAN access for students

Students connect using the teacher device's local IP address, not `localhost`.

### Find your LAN IP

**Windows (PowerShell):**

```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback' } | Select-Object IPAddress, InterfaceAlias
```

**macOS / Linux:**

```bash
ip addr show | grep "inet "
```

Share this link with students (replace with your IP):

```
http://192.168.1.100:3000/join
```

> Student join flow is implemented in Increment 4. The `/join` route will be available then.

## Local development (without Docker)

1. Start PostgreSQL locally (or run only the database container):

```bash
docker compose up postgres -d
```

2. Copy and configure environment:

```bash
cp .env.example .env.local
```

Set `DATABASE_URL` for local Postgres (host is `localhost`, not `postgres`):

```
DATABASE_URL=postgresql://quiz:quizpassword@localhost:5432/quiz_platform
```

3. Install dependencies and migrate:

```bash
npm install
npm run db:migrate
npm run db:seed
```

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login).

## Database commands

| Command               | Description                                |
| --------------------- | ------------------------------------------ |
| `npm run db:generate` | Generate migration SQL from schema changes |
| `npm run db:migrate`  | Apply pending migrations                   |
| `npm run db:seed`     | Seed default teacher account               |
| `npm run db:studio`   | Open Drizzle Studio (local dev)            |

## Project structure

```
src/
  app/
    login/              Teacher login
    teacher/            Protected teacher console
  db/
    schema.ts           Drizzle table definitions
    relations.ts        Drizzle relations
    seed.ts             Default teacher seed
  lib/
    auth.ts             Session helpers
    session.ts          Iron session config
  server/actions/       Server actions
drizzle/                SQL migrations
```

## Increments

This project is built in 8 increments. **Increment 1** (current) includes:

- Docker Compose (web + PostgreSQL)
- Full Drizzle schema and migrations
- Teacher username/password login
- Protected teacher shell (Dashboard, Students, Quizzes)

See `docs/PROJECT_PLAN.md` for the full roadmap (added in Increment 8).

## Environment variables

| Variable            | Description                                                                 |
| ------------------- | --------------------------------------------------------------------------- |
| `POSTGRES_USER`     | PostgreSQL username                                                         |
| `POSTGRES_PASSWORD` | PostgreSQL password                                                         |
| `POSTGRES_DB`       | Database name                                                               |
| `POSTGRES_PORT`     | Host port for Postgres (default `5432`)                                     |
| `APP_PORT`          | Host port for the web app (default `3000`)                                  |
| `TEACHER_USERNAME`  | Seed teacher username                                                       |
| `TEACHER_PASSWORD`  | Seed teacher password                                                       |
| `SESSION_SECRET`    | Cookie encryption secret (32+ characters)                                   |
| `DATABASE_URL`      | Local dev only — use `localhost` as host (Docker builds this automatically) |
