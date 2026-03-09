interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const colorClass =
    score >= 100
      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
      : score >= 50
        ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
        : "bg-blue-500/20 text-blue-400 border-blue-500/30";

  return (
    <span
      className={`inline-flex items-center font-mono font-bold rounded border ${sizeClasses[size]} ${colorClass}`}
    >
      {score} pts
    </span>
  );
}
