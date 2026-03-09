"use client";

interface RealtimeIndicatorProps {
  connected: boolean;
}

export function RealtimeIndicator({ connected }: RealtimeIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`h-2 w-2 rounded-full ${
          connected ? "bg-green-400 animate-pulse" : "bg-red-400"
        }`}
      />
      <span className="text-gray-400">
        {connected ? "Live" : "Reconnecting..."}
      </span>
    </div>
  );
}
