"use client";

import { useState, useCallback } from "react";
import type { QuestBoard as QuestBoardType } from "@/types/quest";
import { QuestColumn } from "./QuestColumn";

interface QuestBoardProps {
  initialData: QuestBoardType;
  currentUser?: string;
}

export function QuestBoard({ initialData, currentUser }: QuestBoardProps) {
  const [board, setBoard] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const refreshBoard = useCallback(async () => {
    try {
      const res = await fetch("/api/quest/board");
      if (res.ok) {
        const data = await res.json();
        setBoard(data);
      }
    } catch (err) {
      console.error("Failed to refresh board:", err);
    }
  }, []);

  const handleClaim = useCallback(
    async (issueNumber: number) => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const res = await fetch("/api/quest/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ issueNumber, username: currentUser }),
        });

        if (!res.ok) {
          const err = await res.json();
          alert(err.error || "Failed to claim quest");
          return;
        }

        await refreshBoard();
      } finally {
        setLoading(false);
      }
    },
    [currentUser, refreshBoard]
  );

  const handleTransfer = useCallback(
    async (issueNumber: number) => {
      const toUser = prompt("Transfer to which user?");
      if (!toUser || !currentUser) return;
      setLoading(true);
      try {
        const res = await fetch("/api/quest/transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ issueNumber, fromUser: currentUser, toUser }),
        });

        if (!res.ok) {
          const err = await res.json();
          alert(err.error || "Failed to transfer quest");
          return;
        }

        await refreshBoard();
      } finally {
        setLoading(false);
      }
    },
    [currentUser, refreshBoard]
  );

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-black/30 z-10 flex items-center justify-center rounded-lg">
          <span className="text-white text-sm">Processing...</span>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        <QuestColumn
          title="Available"
          quests={board.available}
          currentUser={currentUser}
          onClaim={handleClaim}
        />
        <QuestColumn
          title="Claimed"
          quests={board.claimed}
          currentUser={currentUser}
          onTransfer={handleTransfer}
        />
        <QuestColumn
          title="In Progress"
          quests={board.inProgress}
          currentUser={currentUser}
          onTransfer={handleTransfer}
        />
        <QuestColumn
          title="Review"
          quests={board.review}
          currentUser={currentUser}
        />
        <QuestColumn title="Done" quests={board.done} />
      </div>
    </div>
  );
}
