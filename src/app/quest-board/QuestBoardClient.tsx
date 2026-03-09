"use client";

import { useState } from "react";
import { QuestBoard } from "@/components/quest-board/QuestBoard";
import { CreateQuestDialog } from "@/components/quest-board/CreateQuestDialog";
import type { QuestBoard as QuestBoardType } from "@/types/quest";

interface QuestBoardPageClientProps {
  initialBoard: QuestBoardType;
}

export function QuestBoardPageClient({ initialBoard }: QuestBoardPageClientProps) {
  const [showCreate, setShowCreate] = useState(false);

  const handleCreated = () => {
    // Reload the page to get fresh data from GitHub
    window.location.reload();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Quest Board</h1>
          <p className="text-gray-400 text-sm mt-1">
            Claim quests, earn points, level up your team
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 text-sm bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
        >
          + New Quest
        </button>
      </div>

      <QuestBoard initialData={initialBoard} />

      <CreateQuestDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
