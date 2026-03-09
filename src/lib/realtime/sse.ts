import { eventBus, type GameEvent } from "./event-bus";

/**
 * Create an SSE stream that forwards all game events to the client.
 * Used by the /api/events/stream route.
 */
export function createSSEStream(): ReadableStream {
  let eventId = 0;

  return new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      function sendEvent(event: GameEvent) {
        eventId++;
        const data = JSON.stringify({ type: event.type, data: event.data });
        const message = `id: ${eventId}\nevent: game-event\ndata: ${data}\n\n`;
        try {
          controller.enqueue(encoder.encode(message));
        } catch {
          // Stream closed, cleanup
          cleanup();
        }
      }

      // Send heartbeat every 30s to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          cleanup();
        }
      }, 30000);

      function cleanup() {
        eventBus.off("*", sendEvent);
        clearInterval(heartbeat);
      }

      eventBus.on("*", sendEvent);

      // Send initial connection message
      const connectMsg = `id: 0\nevent: connected\ndata: ${JSON.stringify({ status: "connected" })}\n\n`;
      controller.enqueue(encoder.encode(connectMsg));
    },
  });
}
