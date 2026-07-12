export type LeaderboardRow = {
  id: string;
  solvedCount: number;
  totalAccepted: number;
  totalSubmitted: number;
  score: number;
  user: { name: string; email: string };
};

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>User</th>
            <th>Solved</th>
            <th>Accepted</th>
            <th>Submissions</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id}>
              <td>{index + 1}</td>
              <td>{row.user.name}</td>
              <td>{row.solvedCount}</td>
              <td>{row.totalAccepted}</td>
              <td>{row.totalSubmitted}</td>
              <td>{row.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

