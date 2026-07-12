import Link from "next/link";
import { Code2, Cpu, Database, ListChecks, PanelTop, Trophy, Users } from "lucide-react";

export default function HomePage() {
  return (
    <main className="container">
      <div className="page-head">
        <div>
          <h1 className="page-title">CodeArcade</h1>
          <p className="muted">Java judge engine with a queue, worker threads, verdicts, and a TypeScript platform layer.</p>
        </div>
        <div className="toolbar">
          <Link className="btn primary" href="/problems">
            <Code2 size={16} /> Problems
          </Link>
          <Link className="btn" href="/leaderboard">
            <Trophy size={16} /> Leaderboard
          </Link>
        </div>
      </div>
      <section className="home-metrics">
        <div className="metric">
          <strong>3</strong>
          <span>Seeded problems</span>
        </div>
        <div className="metric">
          <strong>5</strong>
          <span>Judge verdicts</span>
        </div>
        <div className="metric">
          <strong>3</strong>
          <span>Worker threads by default</span>
        </div>
      </section>
      <section className="grid">
        <div className="card feature-card">
          <div className="feature-icon"><Cpu size={18} /></div>
          <h3>Judge Core</h3>
          <p className="muted">Submissions are fetched into a Java `BlockingQueue` and processed by multiple `JudgeWorker` threads.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon"><Database size={18} /></div>
          <h3>Platform API</h3>
          <p className="muted">Express, Prisma, PostgreSQL, JWT auth, and Zod validation handle users, problems, and results.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon"><PanelTop size={18} /></div>
          <h3>Contest UI</h3>
          <p className="muted">Browse problems, submit Java or C++ code, inspect verdicts, and track leaderboard rank.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon"><ListChecks size={18} /></div>
          <h3>Fault Review</h3>
          <p className="muted">Wrong submissions show failed input, expected output, actual output, and runtime errors.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon"><Users size={18} /></div>
          <h3>Leaderboard</h3>
          <p className="muted">Score is ranked by difficulty, solved count, and submission efficiency.</p>
        </div>
      </section>
    </main>
  );
}
