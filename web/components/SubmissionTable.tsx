import Link from "next/link";
import { Eye } from "lucide-react";
import { VerdictBadge } from "./VerdictBadge";

export type SubmissionRow = {
  id: string;
  language: string;
  status: string;
  verdict?: string | null;
  passedTests: number;
  totalTests: number;
  executionTimeMs?: number | null;
  createdAt: string;
  problem?: { title: string; slug: string };
};

export function SubmissionTable({ submissions }: { submissions: SubmissionRow[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Problem</th>
            <th>Language</th>
            <th>Verdict</th>
            <th>Tests</th>
            <th>Time</th>
            <th>Submitted</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr key={submission.id}>
              <td>{submission.problem?.title ?? submission.id}</td>
              <td>{submission.language}</td>
              <td>
                <VerdictBadge verdict={submission.verdict} status={submission.status} />
              </td>
              <td>
                {submission.passedTests}/{submission.totalTests}
              </td>
              <td>{submission.executionTimeMs ?? "-"} ms</td>
              <td>{new Date(submission.createdAt).toLocaleString()}</td>
              <td>
                <Link className="btn" href={`/submissions/${submission.id}`} title="View submission details">
                  <Eye size={16} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
