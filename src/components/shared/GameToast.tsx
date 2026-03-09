"use client";

import { useEffect, useState } from "react";

interface GameToastProps {
  message: string;
  type: string;
  onDismiss: () => void;
}

const typeStyles: Record<string, string> = {
  "quest:done": "border-green-500 bg-green-950",
  "quest:claimed": "border-blue-500 bg-blue-950",
  "pr:merged": "border-purple-500 bg-purple-950",
  "score:update": "border-yellow-500 bg-yellow-950",
  "achievement:unlock": "border-amber-400 bg-amber-950",
};

export function GameToast({ message, type, onDismiss }: GameToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const style = typeStyles[type] || "border-gray-500 bg-gray-950";

  return (
    <div
      className={`border-l-4 px-4 py-3 rounded-r text-sm text-white transition-all duration-300 ${style} ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
      }`}
    >
      {message}
    </div>
  );
}
