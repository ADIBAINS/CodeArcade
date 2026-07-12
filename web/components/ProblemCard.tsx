import Link from "next/link";
import { ArrowRight, Cpu, Timer } from "lucide-react";
import { DifficultyBadge } from "./DifficultyBadge";

export type ProblemSummary = {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  timeLimitMs: number;
  memoryLimitMb: number;
};

export function ProblemCard({ problem }: { problem: ProblemSummary }) {
  return (
    <article className="card stack problem-card">
      <div className="problem-card-head">
        <h3>{problem.title}</h3>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>
      <div className="problem-meta">
        <span><Timer size={15} /> {problem.timeLimitMs} ms</span>
        <span><Cpu size={15} /> {problem.memoryLimitMb} MB</span>
      </div>
      <Link className="btn primary" href={`/problems/${problem.slug}`}>
        Solve <ArrowRight size={16} />
      </Link>
    </article>
  );
}
