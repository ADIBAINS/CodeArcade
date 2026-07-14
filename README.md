# CodeArcade

**CodeArcade: A Java-Based Competitive Programming Judge using Queue and Multithreading**

CodeArcade is a competitive programming judge where the TypeScript API and Next.js frontend are platform layers, while the Java judge engine handles the DSA-focused core: a `BlockingQueue`, multiple judge worker threads, compilation, execution, output comparison, verdict generation, and result reporting.

## Structure

```text
codearcade/
├── api/         # Express + TypeScript + Prisma + Zod API
├── web/         # Next.js + TypeScript frontend
├── judge-core/  # Java judge engine with queue and worker threads
└── docker-compose.yml
```

## Quick Start

**First time setup:**

```bash
npm install
cd api && npm install && cd ../web && npm install && cd ../judge-core && mvn package -q -DskipTests
cd ../api && npx prisma migrate dev --name init && npm run seed && cd ..
```

**Run everything (PostgreSQL + API + Web + Judge):**

```bash
npm run all
```

This starts all 4 services:

| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:3000  |
| API      | http://localhost:4000  |
| Database | localhost:5432         |
| Judge    | local execution mode  |

**Other commands:**

| Command           | Description                      |
|-------------------|----------------------------------|
| `npm run all`     | Start all services               |
| `npm run db`      | Start PostgreSQL only            |
| `npm run db:down` | Stop PostgreSQL                  |
| `npm run seed`    | Seed the database                |
| `npm run build`   | Build API and frontend           |

Default local seeded admin:

- Email: `admin@codearcade.local`
- Password: `admin123`

For production, set `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` before running the seed.

## Features

- **Problems**: Browse and solve coding problems with a built-in Monaco editor
- **Submissions**: Submit Java or C++ code and get real-time verdicts (AC, WA, TLE, CE, RE)
- **Leaderboard**: Global scoring with difficulty-weighted points
- **Problem Requests**: Users can suggest new problems; admins review, approve (auto-creates the problem), or reject with feedback
- **Judge Engine**: Multithreaded Java judge with BlockingQueue, supporting local and Docker execution modes

## API Routes

### Public

| Method | Path                  | Description          |
|--------|-----------------------|----------------------|
| GET    | `/api/problems`       | List all problems    |
| GET    | `/api/problems/:slug` | Get problem detail   |
| GET    | `/api/leaderboard`    | Global leaderboard   |

### Authenticated

| Method | Path                      | Description              |
|--------|---------------------------|--------------------------|
| POST   | `/api/requests`           | Submit a problem request |
| GET    | `/api/requests/mine`      | List your requests       |
| GET    | `/api/requests/:id`       | Request detail           |
| POST   | `/api/submissions`        | Submit code              |
| GET    | `/api/submissions/:id`    | Submission detail        |

### Admin

| Method | Path                             | Description                |
|--------|----------------------------------|----------------------------|
| POST   | `/api/problems`                  | Create a problem           |
| PUT    | `/api/problems/:id`              | Update a problem           |
| DELETE | `/api/problems/:id`              | Delete a problem           |
| POST   | `/api/problems/:id/testcases`    | Add a test case            |
| GET    | `/api/requests/admin/all`        | List all requests          |
| POST   | `/api/requests/admin/:id/approve`| Approve (creates Problem)  |
| POST   | `/api/requests/admin/:id/reject` | Reject with reason         |

## Deployment

**EC2 / VPS (single command):**

```bash
git clone <repo-url> && cd codearcade
./deploy.sh
```

This generates a `.env` with random secrets, builds all Docker images, starts all 4 services, and seeds the database.

**Manual:**

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec -T api npx prisma db seed
```

**Environment variables** (set in `.env`):

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | Database password | random |
| `JWT_SECRET` | Token signing key | random |
| `INTERNAL_JUDGE_TOKEN` | Judge-to-API auth | random |
| `ADMIN_EMAIL` | Seed admin email | `admin@codearcade.local` |
| `ADMIN_PASSWORD` | Seed admin password | random |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Frontend -> API URL | `http://localhost:4000` |
| `JUDGE_EXECUTION_MODE` | `local` or `docker` | `docker` |

**Useful commands:**

```bash
docker compose -f docker-compose.prod.yml logs -f api     # API logs
docker compose -f docker-compose.prod.yml logs -f judge   # Judge logs
docker compose -f docker-compose.prod.yml down            # Stop all
docker compose -f docker-compose.prod.yml up -d --build   # Rebuild and restart
```

## Security Scope

Local judge mode is suitable only for a closed classroom/demo environment. It uses temporary workspaces, execution timeouts, Java `-Xmx`, and a C++ `ulimit` wrapper. Public deployments must run the judge with Docker execution mode:

```bash
CODEARCADE_ENV=production \
JUDGE_EXECUTION_MODE=docker \
API_BASE_URL=https://your-api.example.com \
INTERNAL_JUDGE_TOKEN=your-long-random-token \
java -jar target/codearcade-judge-core-1.0.0.jar
```

Docker execution mode runs each compile/execution in a container with disabled networking, memory/PID/CPU limits, dropped Linux capabilities, no-new-privileges, and a read-only filesystem during execution. Keep the API and database off the public internet except through the web/API entrypoints, and use long random values for `JWT_SECRET` and `INTERNAL_JUDGE_TOKEN`.
