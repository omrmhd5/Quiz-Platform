# Quiz Platform

Local-network quiz platform for classroom use. One teacher runs the app on their device; students join from phones or tablets on the same Wi‑Fi using their student ID.

## Stack

- Next.js 16 (App Router)
- PostgreSQL 18
- Drizzle ORM
- Docker Compose

## Quick start (development)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and Node.js.

2. Create a `.env` file in the project root (see [Environment variables](#environment-variables) below).

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

> Docker runs **Postgres only**. Use `npm run dev` for the app with hot reload.

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

Students open `/join` on the teacher's LAN IP, enter their student ID, and join the active quiz session. When you use the teacher console on `localhost`, the join link automatically uses your machine's LAN IP (e.g. `http://192.168.1.100:3000/join`). Set `LAN_HOST` in `.env` to override if you have multiple network adapters.

> **Phone can't load the page?** The app works on any phone browser — there is no mobile app and **HTTP is fine** on a local network (HTTPS is not required). Use `/join` (not `/`, which goes to teacher login). Phone and PC must be on the **same Wi‑Fi** (not guest/isolated Wi‑Fi, not mobile data).

**Most common fix on Windows:** your PC allows `localhost` but blocks other devices. Open **PowerShell as Administrator** in the project folder and run:

```powershell
npm run dev:firewall
```

Then restart `npm run dev` and try `http://YOUR_LAN_IP:3000/join` on the phone again.

If it still fails: confirm the phone is on Wi‑Fi (not cellular), disable VPN on the phone, and check the router does not use "AP isolation" / "client isolation".

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
- **Increment 4** — Launch live sessions, student join at `/join`, attempt placeholder at `/quiz/[attemptId]`
- **Increment 5** — Shuffled MCQ quiz taking, submit, auto-grading, student score screen
- **Increment 6** — Session results on each quiz detail page with live updates
- **Increment 7** — Quiz stats per session and student quiz history
- **Increment 8** — General dashboard at `/teacher/dashboard`

**Increment 2** includes:

- Student roster: add, edit name, delete, search, bulk import

**Increment 3** includes:

- Create MCQ quizzes via **manual builder** (Google Forms style) or **paste import**
- Paste format: blank line between questions, `A)` options (count auto-detected)
- Quiz list, detail view, edit, and delete (editing or deleting after a session removes all related session data)

**Increment 4** includes:

- Teacher launches a quiz from the quiz detail page (one active session globally)
- Copyable join URL for the classroom network
- Students join at `/join` with their registered ID
- Attempt created or resumed; placeholder start screen at `/quiz/[attemptId]`

**Increment 5** includes:

- Questions and answer options shuffled per student attempt
- Full quiz UI at `/quiz/[attemptId]` with radio MCQ answers
- Submit with confirmation; server-side grading
- Results screen: score %, correct, wrong, and skipped counts (no answer review)

**Increment 6** includes:

- Results section on `/teacher/quizzes/[id]` for every session of that quiz
- Student scores, status, and summary stats per session
- Live refresh while a session is active
- Jump links from the launch panel and live banner

**Increment 7** includes:

- Quiz stats in session results: highest/lowest score, participation, most missed / easiest question, per-question correct %
- Student quiz history at `/teacher/students/[id]/history`
- History links from the student roster and session results table

**Increment 8** includes:

- Real dashboard at `/teacher/dashboard` — totals, recent sessions, score trend, most missed questions globally
- Live session banner on dashboard when a quiz is running

## Environment variables

| Variable            | Description                                                               |
| ------------------- | ------------------------------------------------------------------------- |
| `POSTGRES_USER`     | PostgreSQL username                                                       |
| `POSTGRES_PASSWORD` | PostgreSQL password                                                       |
| `POSTGRES_DB`       | Database name                                                             |
| `POSTGRES_PORT`     | Host port for Postgres (use `5433` if local Postgres already uses `5432`) |
| `APP_PORT`          | Host port for the web app (default `3000`)                                |
| `LAN_HOST`          | Optional LAN IP or host for student join links (auto-detected if omitted) |
| `TEACHER_USERNAME`  | Seed teacher username                                                     |
| `TEACHER_PASSWORD`  | Seed teacher password                                                     |
| `SESSION_SECRET`    | Cookie encryption secret (32+ characters)                                 |
| `DATABASE_URL`      | Local dev — use `localhost` as host                                       |
