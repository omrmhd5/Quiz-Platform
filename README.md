# Quiz Platform

Local-network quiz platform for classroom use. One teacher runs the app on their device; students join from phones or tablets on the same Wi‑Fi using their student ID.

## Stack

- Next.js 16 (App Router)
- PostgreSQL 18
- Drizzle ORM
- Docker Compose

## Quick start (development)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and Node.js.

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Start PostgreSQL (Docker, background):

```bash
npm run docker
```

4. First time only — migrate and seed:

```bash
npm run db:migrate
npm run db:seed
```

5. Start the app with hot reload:

```bash
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login).

Default teacher credentials (from `.env`):

- **Username:** `admin` (or your `TEACHER_USERNAME`)
- **Password:** `admin123` (or your `TEACHER_PASSWORD`)

Stop the database when done:

```bash
npm run docker:down
```

> **Production Docker** (web + postgres in containers) will be added later. For now, Docker runs **Postgres only**; use `npm run dev` for the app.

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

## Database commands

| Command               | Description                                |
| --------------------- | ------------------------------------------ |
| `npm run db:generate` | Generate migration SQL from schema changes |
| `npm run db:migrate`  | Apply pending migrations                   |
| `npm run db:seed`     | Seed default teacher account               |
| `npm run db:studio`   | Open Drizzle Studio (local dev)            |

## Project structure

```
docker/
  docker-compose.yml    Postgres only (dev)
  Dockerfile            Production app image (later)
  entrypoint.sh         Production startup (later)
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

This project is built in 8 increments.

- **Increment 1** — Docker, Drizzle, teacher login, protected shell
- **Increment 2** — Student roster CRUD + bulk import at `/teacher/students`
- **Increment 3** — MCQ quiz creation at `/teacher/quizzes` (paste, mark correct, save/list/edit/delete)

**Increment 2** includes:

- Student roster: add, edit name, delete, search, bulk import

**Increment 3** includes:

- Create MCQ quizzes via **manual builder** (Google Forms style) or **paste import**
- Paste format: blank line between questions, `A)` options (count auto-detected)
- Quiz list, detail view, edit, and delete (blocked if quiz has sessions)

See `docs/PROJECT_PLAN.md` for the full roadmap (added in Increment 8).

## Environment variables

| Variable            | Description                                                                 |
| ------------------- | --------------------------------------------------------------------------- |
| `POSTGRES_USER`     | PostgreSQL username                                                         |
| `POSTGRES_PASSWORD` | PostgreSQL password                                                         |
| `POSTGRES_DB`       | Database name                                                               |
| `POSTGRES_PORT`     | Host port for Postgres (use `5433` if local Postgres already uses `5432`)   |
| `APP_PORT`          | Host port for the web app (default `3000`)                                  |
| `TEACHER_USERNAME`  | Seed teacher username                                                       |
| `TEACHER_PASSWORD`  | Seed teacher password                                                       |
| `SESSION_SECRET`    | Cookie encryption secret (32+ characters)                                   |
| `DATABASE_URL`      | Local dev only — use `localhost` as host (Docker builds this automatically) |
