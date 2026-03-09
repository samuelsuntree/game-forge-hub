"use client";

import Link from "next/link";
import { RealtimeIndicator } from "../shared/RealtimeIndicator";
import { useGameEvents } from "@/hooks/useGameEvents";
import { GameToast } from "../shared/GameToast";

export function Navbar() {
  const { connected, notifications, dismissNotification } = useGameEvents();

  return (
    <>
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-white tracking-tight">
              GameForge<span className="text-blue-400">Hub</span>
            </Link>
            <div className="hidden sm:flex items-center gap-4">
              <Link
                href="/quest-board"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Quest Board
              </Link>
              <Link
                href="/idea-arena"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Idea Arena
              </Link>
              <Link
                href="/live-roadmap"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Live Roadmap
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Leaderboard
              </Link>
            </div>
          </div>
          <RealtimeIndicator connected={connected} />
        </div>
      </nav>

      {/* Toast notifications */}
      <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {notifications.slice(0, 5).map((n) => (
          <GameToast
            key={n.id}
            message={n.message}
            type={n.type}
            onDismiss={() => dismissNotification(n.id)}
          />
        ))}
      </div>
    </>
  );
}
