export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return <span className={`badge ${difficulty.toLowerCase()}`}>{difficulty}</span>;
}

