"use client";

import type { Quest } from "@/types/quest";
import { ScoreBadge } from "../shared/ScoreBadge";

interface QuestCardProps {
  quest: Quest;
  currentUser?: string;
  onClaim?: (issueNumber: number) => void;
  onTransfer?: (issueNumber: number) => void;
}

const difficultyColors = {
  easy: "bg-sky-500/20 text-sky-400",
  normal: "bg-blue-500/20 text-blue-400",
  hard: "bg-orange-500/20 text-orange-400",
  epic: "bg-red-500/20 text-red-400",
};

const statusColors = {
  available: "border-green-600",
  claimed: "border-yellow-600",
  "in-progress": "border-blue-600",
  review: "border-purple-600",
  done: "border-gray-600",
};

export function QuestCard({ quest, currentUser, onClaim, onTransfer }: QuestCardProps) {
  const canClaim = quest.status === "available" && currentUser;
  const canTransfer = quest.claimedBy === currentUser && quest.status !== "done";

  return (
    <div
      className={`border-l-4 rounded-lg bg-gray-900 p-4 hover:bg-gray-800 transition-colors ${statusColors[quest.status]}`}
    >
      <div className="flex items-start justify-between gap-2">
        <a
          href={quest.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-white hover:text-blue-400 transition-colors"
        >
          #{quest.issueNumber} {quest.title}
        </a>
        <ScoreBadge score={quest.basePoints + quest.bonusPoints} size="sm" />
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[quest.difficulty]}`}>
          {quest.difficulty}
        </span>
        {quest.type && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
            {quest.type}
          </span>
        )}
        {quest.milestoneTitle && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
            {quest.milestoneTitle}
          </span>
        )}
      </div>

      {quest.assignees.length > 0 && (
        <div className="mt-3 flex items-center gap-1">
          {quest.assignees.map((a) => (
            <span
              key={a}
              className="text-xs bg-gray-700 rounded px-2 py-0.5 text-gray-300"
            >
              @{a}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {canClaim && onClaim && (
          <button
            onClick={() => onClaim(quest.issueNumber)}
            className="text-xs px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-white transition-colors"
          >
            Claim Quest
          </button>
        )}
        {canTransfer && onTransfer && (
          <button
            onClick={() => onTransfer(quest.issueNumber)}
            className="text-xs px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-500 text-white transition-colors"
          >
            Transfer
          </button>
        )}
      </div>
    </div>
  );
}
