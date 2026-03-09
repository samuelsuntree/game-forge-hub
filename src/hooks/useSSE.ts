"use client";

import { useEffect, useCallback, useRef, useState } from "react";

interface GameEventData {
  type: string;
  data: unknown;
}

export function useSSE(onEvent?: (event: GameEventData) => void) {
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource("/api/events/stream");

    es.addEventListener("connected", () => {
      setConnected(true);
    });

    es.addEventListener("game-event", (e) => {
      try {
        const data = JSON.parse(e.data) as GameEventData;
        onEventRef.current?.(data);
      } catch (err) {
        console.error("Failed to parse SSE event:", err);
      }
    });

    es.onerror = () => {
      setConnected(false);
      es.close();
      // Reconnect after 3 seconds
      setTimeout(connect, 3000);
    };

    eventSourceRef.current = es;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
    };
  }, [connect]);

  return { connected };
}
