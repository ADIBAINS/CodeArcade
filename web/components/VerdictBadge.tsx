export function VerdictBadge({ verdict, status }: { verdict?: string | null; status?: string }) {
  const label = verdict ?? status ?? "PENDING";
  return <span className={`badge ${label.toLowerCase()}`}>{label}</span>;
}

