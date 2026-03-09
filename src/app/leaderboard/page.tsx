"use client";

import { useEffect, useState } from "react";
import { ScoreBadge } from "@/components/shared/ScoreBadge";
import type { UserScore } from "@/types/score";

export default function LeaderboardPage() {
  const [users, setUsers] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/score")
      .then((r) => r.json())
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          Team scoring based on quest completion, reviews, and collaboration
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl">
          <p className="text-gray-500">No scores yet</p>
          <p className="text-gray-600 text-sm mt-1">
            Start claiming and completing quests to earn points
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.githubLogin}
              className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                user.rank <= 3
                  ? "bg-gray-900 border border-gray-700"
                  : "bg-gray-900/50"
              }`}
            >
              <span
                className={`text-lg font-bold w-8 text-center ${
                  user.rank === 1
                    ? "text-amber-400"
                    : user.rank === 2
                      ? "text-gray-300"
                      : user.rank === 3
                        ? "text-orange-400"
                        : "text-gray-600"
                }`}
              >
                #{user.rank}
              </span>

              {user.avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.githubLogin}
                  className="w-8 h-8 rounded-full"
                />
              )}

              <div className="flex-1">
                <span className="text-white font-medium">
                  {user.displayName || user.githubLogin}
                </span>
                <span className="text-gray-500 text-sm ml-2">
                  @{user.githubLogin}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  WIP: {user.currentWip}/{user.wipLimit}
                </span>
                <ScoreBadge score={user.totalScore} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
