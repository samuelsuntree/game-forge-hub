"use client";

import { useState, useCallback } from "react";
import { useSSE } from "./useSSE";

interface GameNotification {
  id: string;
  type: string;
  message: string;
  timestamp: number;
}

export function useGameEvents() {
  const [notifications, setNotifications] = useState<GameNotification[]>([]);

  const handleEvent = useCallback((event: { type: string; data: unknown }) => {
    const data = event.data as Record<string, unknown>;

    let message = "";
    switch (event.type) {
      case "quest:claimed":
        message = `${data.claimedBy} accepted quest: ${data.title}`;
        break;
      case "quest:done":
        message = `${data.completedBy} completed quest: ${data.title}`;
        break;
      case "pr:merged":
        message = `${data.author} merged PR: ${data.title}`;
        break;
      case "score:update":
        message = `${data.username} earned ${data.points} points: ${data.reason}`;
        break;
      case "achievement:unlock":
        message = `${data.username} unlocked achievement: ${data.achievementKey}`;
        break;
      default:
        message = `Event: ${event.type}`;
    }

    const notification: GameNotification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: event.type,
      message,
      timestamp: Date.now(),
    };

    setNotifications((prev) => [notification, ...prev].slice(0, 50));
  }, []);

  const { connected } = useSSE(handleEvent);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { connected, notifications, dismissNotification };
}
