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

1. Start PostgreSQL:

```bash
docker compose up -d
```

2. Configure and run the API:

```bash
cd api
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

3. Configure and run the web app:

```bash
cd web
cp .env.local.example .env.local
npm install
npm run dev
```

4. Run the Java judge:

```bash
cd judge-core
mvn package
API_BASE_URL=http://localhost:4000 INTERNAL_JUDGE_TOKEN=change-me-use-openssl-rand-hex-32 java -jar target/codearcade-judge-core-1.0.0.jar
```

Default local seeded admin:

- Email: `admin@codearcade.local`
- Password: `admin123`

For production, set `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` before running the seed.

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
