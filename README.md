# CodeArcade

A LeetCode-style competitive programming judge. Write a `Solution` class in **Java** or **C++**, submit it, and get a verdict in seconds — with real compiler errors, per-testcase results, and a global leaderboard.

**Stack:** Express + TypeScript + Prisma + Zod API · Next.js 15 + Monaco editor · Java 17 judge engine · PostgreSQL 16.

## Features

- **100 seeded problems** (53 Easy / 34 Medium / 13 Hard), all LeetCode-style function problems in Java and C++
- **Uniform judging**: one compile, one locked-down container run per testcase, identical output rules in both languages
- **Verdicts**: `AC` Accepted · `WA` Wrong Answer · `TLE` Time Limit Exceeded · `CE` Compile Error (with real compiler output) · `RE` Runtime Error · `MLE` Memory Limit Exceeded
- **Leaderboard**: difficulty-weighted scoring (Easy 100 / Medium 200 / Hard 300, first solve counts)
- **Problem requests**: users suggest problems; admins approve (auto-creates the problem), reject with feedback, or mark in-review
- **Live result pages**: polling verdict view with runtime, passed tests, failed input, expected vs actual output, and your code

## Repository structure

```text
codearcade/
├── api/                    # Express + TypeScript + Prisma + Zod API
│   ├── src/modules/        # auth, problems, submissions, testcases, leaderboard, requests, judge
│   ├── src/middlewares/    # auth, admin, judge-token, validation, request-id
│   ├── src/config/env.ts   # validated environment (fails fast on bad config)
│   └── prisma/             # schema, migrations, seed (100 problems + admin)
├── web/                    # Next.js frontend (Monaco editor, dark arcade theme)
│   ├── app/                # problems, submissions, leaderboard, requests, admin
│   ├── components/         # CodeEditor, tables, badges, pager, error boundary
│   └── lib/                # api client (pagination + non-JSON guard), templates, cn, time
├── judge-core/             # Java judge engine (queue + worker threads + docker sandbox)
├── nginx/                  # in-stack reverse proxy (`/api` → api, `/` → web)
├── docker-compose.yml      # local dev: PostgreSQL only
├── docker-compose.prod.yml # production: postgres + api + web + judge + nginx
└── deploy.sh               # single-command production deploy
```

## Quick start (local dev)

**First time:**

```bash
npm run setup     # installs api + web deps, builds the judge jar
npm run db        # starts PostgreSQL (localhost:5432, user/password: codearcade)
cd api && npx prisma migrate dev && npm run seed && cd ..
```

**Run everything:**

```bash
npm run all       # postgres + api + web + judge (local execution mode)
```

| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:3000 |
| API      | http://localhost:4000 |
| Database | localhost:5432        |
| Judge    | local execution mode  |

**Other commands:**

| Command           | Description                              |
|-------------------|------------------------------------------|
| `npm run all`     | Start postgres, API, web, and judge      |
| `npm run start`   | Same, but from built output (`npm run build` first) |
| `npm run db` / `npm run db:down` | Start / stop PostgreSQL      |
| `npm run seed`    | Seed admin + 100 problems (idempotent upsert) |
| `npm run build`   | Typecheck/build API and frontend         |

Default local seeded admin: `admin@codearcade.local` / `admin123`. Set a strong `ADMIN_PASSWORD` before seeding anything shared.

> Local judge mode runs submissions directly on your machine with only timeouts/`ulimit` for protection — fine for personal dev, never expose it. Production must use docker execution mode (see Security).

## Solving problems

Each problem shows its **signature**, e.g. `int solve(int[] nums)`. Write only the `Solution` class — no `main`, no package/imports (C++ gets `#include <bits/stdc++.h>` automatically). The editor pre-fills a template with the right signature and parameter names.

```java
// Java
class Solution {
    public int solve(int[] nums) {
        int sum = 0;
        for (int x : nums) {
            if (x % 2 == 0) sum += x;
        }
        return sum;
    }
}
```

```cpp
// C++
class Solution {
public:
    int solve(vector<int> nums) {
        int sum = 0;
        for (int x : nums) {
            if (x % 2 == 0) sum += x;
        }
        return sum;
    }
};
```

**Supported types** (`argumentTypes`, `returnType`): `int`, `long`, `double`, `boolean`, `char`, `String`, plus one-dimensional arrays (`int[]`, `String[]`, …). Nested arrays are rejected at problem creation.

**Canonical output** (identical in both languages, this is what gets compared): booleans print `true`/`false`, integral doubles print without decimals (`2`, not `2.0`), arrays print as `[a, b, c]`. Comparison ignores trailing whitespace per line and trailing blank lines.

**Limits** come from the problem: time 500–10000 ms per testcase (default 2000), memory 64–1024 MB (default 256). Submissions are capped at 20,000 characters.

## How judging works

1. `POST /api/submissions` stores the code as `PENDING` (rate-limited: 10/min).
2. The judge polls `POST /api/internal/judge/pending`, atomically claims rows (`RUNNING`), and queues them on a bounded `BlockingQueue`.
3. A worker thread per core-equivalent: creates an isolated workspace → generates **one indexed-dispatch harness** for all testcases → **compiles once** → runs **one container per testcase** → compares output → reports via `POST /api/internal/judge/results` (idempotent; leaderboard only counts first solves, downgrades roll back score).
4. The submission page polls until the verdict lands.

**Sandbox (docker mode):** no network, memory+swap cap, PIDs limit, 1 CPU, dropped capabilities, no-new-privileges, **read-only filesystem during execution** (compile containers stay writable — `javac` requires it), per-run `ulimit` wrapper for C++, images pre-pulled at boot, JRE-only image for Java execution.

## API reference

Auth is cookie (`codearcade_session`, 24 h JWT) and/or `Authorization: Bearer`. Roles: `USER`, `ADMIN`. Lists are paginated: `?page=1&limit=20` (max 100) → `{ "data": [...], "meta": { total, page, limit, totalPages } }`. Validation failures return `400` with per-field `details[]`. Every response carries `X-Request-Id`; `GET /health` (liveness) and `GET /readyz` (DB probe) are unauthenticated.

### Auth — `/api/auth`

| Method | Path             | Auth | Description                          |
|--------|------------------|------|--------------------------------------|
| POST   | `/api/auth/register` | – | Register (returns user + token)   |
| POST   | `/api/auth/login`    | – | Login (returns user + token)      |
| POST   | `/api/auth/logout`   | cookie | Clear session                  |
| GET    | `/api/auth/me`       | yes | Current user                      |

Login/register are rate-limited (20/15 min). JWTs expire after 24 h.

### Problems — `/api/problems`

| Method | Path                              | Auth  | Description                          |
|--------|-----------------------------------|-------|--------------------------------------|
| GET    | `/api/problems?page=&limit=`      | –     | List (paginated, with submit counts) |
| GET    | `/api/problems/count`             | –     | Total count                          |
| GET    | `/api/problems/:slug`             | optional | Detail; testcases (admins see hidden `expected`) |
| POST   | `/api/problems`                   | admin | Create (FUNCTION signature validated) |
| PUT    | `/api/problems/:id`               | admin | Update                               |
| DELETE | `/api/problems/:id`               | admin | Delete                               |
| GET    | `/api/problems/:problemId/testcases`  | optional | List testcases (paginated, max 100) |
| POST   | `/api/problems/:problemId/testcases`  | admin | Add a testcase (`input`, `expected`, `isHidden`) |

### Submissions — `/api/submissions`

| Method | Path                                  | Auth | Description                              |
|--------|---------------------------------------|------|------------------------------------------|
| POST   | `/api/submissions`                    | yes  | Submit `{ problemId, language, sourceCode }` |
| GET    | `/api/submissions/me`                 | yes  | Your submissions (paginated, no source code) |
| GET    | `/api/submissions/problem/:problemId` | yes  | Yours per problem (admins: everyone's)   |
| GET    | `/api/submissions/:id`                | owner/admin | Full detail incl. code + error text |
| GET    | `/api/users/me/submissions`           | yes  | Legacy alias of `/me`                    |
| GET    | `/api/problems/:problemId/submissions`| yes  | Legacy alias of `/problem/:problemId`    |

### Leaderboard — `/api/leaderboard`

| Method | Path                          | Auth | Description                              |
|--------|-------------------------------|------|------------------------------------------|
| GET    | `/api/leaderboard?page=&limit=` | –  | Ranked by score → solved → fewest submits (names only, no emails) |

### Problem requests — `/api/requests`

| Method | Path                                | Auth  | Description                              |
|--------|-------------------------------------|-------|------------------------------------------|
| POST   | `/api/requests`                     | yes   | Suggest (title ≥ 3, statement ≥ 20, formats/constraints ≥ 5) |
| GET    | `/api/requests/mine?page=&limit=`   | yes   | Your requests (paginated)                |
| GET    | `/api/requests/:id`                 | owner/admin | Request detail                     |
| GET    | `/api/requests/admin/all?status=`   | admin | All requests, filterable, paginated      |
| GET    | `/api/requests/admin/:id`           | admin | Admin detail                             |
| PUT    | `/api/requests/admin/:id`           | admin | Admin edit                               |
| POST   | `/api/requests/admin/:id/approve`   | admin | Approve → creates the Problem (race-safe, preserves notes) |
| POST   | `/api/requests/admin/:id/reject`    | admin | Reject with `adminNotes`                 |
| POST   | `/api/requests/admin/:id/in-review` | admin | Mark in-review                           |

### Judge-internal — `/api/internal/judge` (Bearer `INTERNAL_JUDGE_TOKEN`, timing-safe compare)

| Method | Path                              | Description                              |
|--------|-----------------------------------|------------------------------------------|
| POST   | `/api/internal/judge/pending`     | Claim up to `limit` (≤ 50) pending/stale submissions |
| POST   | `/api/internal/judge/results`     | Report `{ submissionId, verdict, passedTests ≤ totalTests, … }` |

## Configuration

**Root `.env`** (production; `deploy.sh` generates one with random secrets):

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Database credentials | `codearcade` / random / `codearcade` |
| `JWT_SECRET` | Session signing key (≥ 32 chars) | random |
| `INTERNAL_JUDGE_TOKEN` | Judge-to-API token (timing-safe) | random |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed admin | `admin@codearcade.local` / random |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost` |
| `NEXT_PUBLIC_API_URL` | Baked into web at build; empty = same-origin `/api` via Nginx | empty |
| `API_HOST_PORT` / `WEB_HOST_PORT` / `NGINX_HOST_PORT` | Loopback ports for the host TLS proxy | `4000` / `3000` / `8080` |
| `JUDGE_DOCKER_WORKSPACE_ROOT` | Host path for isolated judge workspaces | `<project>/judge-workspaces` |

**API env** (`GLOBAL_RATE_LIMIT` 300/15 min, `AUTH_RATE_LIMIT` 20/15 min, `SUBMISSION_RATE_LIMIT` 10/min, `JUDGE_RATE_LIMIT` 600/min, `JUDGE_STALE_THRESHOLD_MS` 60000, `JUDGE_RESULT_RETRY_ATTEMPTS` 3, `TRUST_PROXY`, `PORT`, `DATABASE_URL`) — all validated at boot by `src/config/env.ts`; misconfiguration crashes loudly instead of silently disabling limits.

**Judge env** (`judge-core`): `API_BASE_URL`, `INTERNAL_JUDGE_TOKEN`, `CODEARCADE_ENV=production` (forces docker mode), `JUDGE_EXECUTION_MODE`, `JUDGE_WORKER_COUNT` (1–32, default 3), `JUDGE_POLL_INTERVAL_MS`, `JUDGE_FETCH_LIMIT`, `JUDGE_WORKSPACE_ROOT`, `JUDGE_DOCKER_WORKSPACE_ROOT`, `JUDGE_DOCKER_BINARY`, `JUDGE_JAVA_IMAGE` (compile, JDK), `JUDGE_JAVA_RUN_IMAGE` (execute, JRE), `JUDGE_CPP_IMAGE`, `JUDGE_DOCKER_USER`, `JUDGE_DOCKER_CPUS`, `JUDGE_COMPILER_MEMORY_MB`, `JUDGE_COMPILE_TIMEOUT_SECONDS`, `JUDGE_HTTP_*_TIMEOUT_SECONDS`, `JUDGE_MAX_SOURCE_BYTES` (20000), `JUDGE_MAX_TESTCASES` (100), `JUDGE_MAX_OUTPUT_BYTES` (1 MB). All range-checked at boot.

## Deployment

**EC2 / VPS (single command):**

```bash
git clone <repo-url> && cd codearcade
./deploy.sh
```

Generates `.env` with random secrets, builds all images, starts the stack, and seeds the database. API/web bind only to `127.0.0.1`; terminate TLS in your host proxy and forward to them. For a domain, set `CORS_ORIGIN=https://app.example.com` and leave `NEXT_PUBLIC_API_URL` empty so the frontend uses same-origin `/api`.

**Manual:**

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec -T api npx prisma db seed
```

**Useful commands:**

```bash
docker compose -f docker-compose.prod.yml logs -f api     # API logs (structured JSON)
docker compose -f docker-compose.prod.yml logs -f judge   # Judge logs (compile/run per submission)
docker compose -f docker-compose.prod.yml ps              # health status
docker compose -f docker-compose.prod.yml up -d --build api   # rebuild one service
docker compose -f docker-compose.prod.yml down            # stop all (data kept in volume)
```

## Security notes

- Production **must** run the judge with `JUDGE_EXECUTION_MODE=docker` (enforced at boot when `CODEARCADE_ENV=production`). Local mode is a classroom/demo convenience only.
- The judge needs the host Docker socket — a judge compromise equals host compromise. Prefer an isolated worker host; at minimum keep the daemon and socket permissions tight.
- Rotate `JWT_SECRET` to log everyone out; rotate `INTERNAL_JUDGE_TOKEN` on both API and judge together.
- Never commit `.env` files — `api/.env`, `web/.env`, and root `.env` are all git-ignored. Never publish demo passwords in the repo.

## Troubleshooting

| Symptom | Likely cause → fix |
|---------|-------------------|
| UI shows `API request failed (HTTP 502)` | API container down/crash-looping → `logs -f api`; in-stack Nginx caches upstream IPs, `restart nginx` after recreating API |
| `migrate deploy` refuses with `P3009` failed migration | `docker compose -f docker-compose.prod.yml run --rm api sh -c 'npx prisma migrate resolve --rolled-back "<name>"'`, fix the SQL, rebuild, deploy again |
| `ALTER TYPE ... ADD VALUE` in a migration | Postgres forbids it inside a transaction: apply via `psql`, then `migrate resolve --applied "<name>"` (see `20260904120000_add_mle_verdict/migration.sql`) |
| Submission stuck `RUNNING` | Judge crashed mid-run; the fetcher reclaims stale (`RUNNING` older than `JUDGE_STALE_THRESHOLD_MS`, default 60 s) automatically |
| `CE` on Java but code looks right | Check `errorMessage` on the submission — it now carries real `javac`/`g++` output; most often a wrong method name/signature vs the problem's Signature box |
| `ClassNotFoundException: Main` (Java) | Historical data issue: problem row had empty `judgeMode`; reseed (`npm run seed` in `api/`) so all problems are `FUNCTION` |
| Disk full during builds (`no space left`) | `docker builder prune -f` after build days; `docker image prune -a -f` drops superseded app images (running ones are protected); grow the volume past ~85% sustained use |
