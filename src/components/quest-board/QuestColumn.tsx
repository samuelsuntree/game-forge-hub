import type { Quest } from "@/types/quest";
import { QuestCard } from "./QuestCard";

interface QuestColumnProps {
  title: string;
  quests: Quest[];
  currentUser?: string;
  onClaim?: (issueNumber: number) => void;
  onTransfer?: (issueNumber: number) => void;
  wipLimit?: number;
}

export function QuestColumn({
  title,
  quests,
  currentUser,
  onClaim,
  onTransfer,
  wipLimit,
}: QuestColumnProps) {
  const isOverWip = wipLimit !== undefined && quests.length > wipLimit;

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          {title}
        </h3>
        <span
          className={`text-xs font-mono px-2 py-0.5 rounded ${
            isOverWip
              ? "bg-red-500/20 text-red-400"
              : "bg-gray-700 text-gray-400"
          }`}
        >
          {quests.length}
          {wipLimit !== undefined && `/${wipLimit}`}
        </span>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {quests.map((quest) => (
          <QuestCard
            key={quest.issueNumber}
            quest={quest}
            currentUser={currentUser}
            onClaim={onClaim}
            onTransfer={onTransfer}
          />
        ))}
        {quests.length === 0 && (
          <div className="text-center text-gray-600 text-sm py-8 border border-dashed border-gray-800 rounded-lg">
            No quests
          </div>
        )}
      </div>
    </div>
  );
}
