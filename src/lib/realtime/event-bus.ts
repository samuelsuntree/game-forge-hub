import { EventEmitter } from "events";

export type GameEvent =
  | { type: "quest:new"; data: unknown }
  | { type: "quest:claimed"; data: unknown }
  | { type: "quest:moved"; data: unknown }
  | { type: "quest:done"; data: unknown }
  | { type: "quest:released"; data: unknown }
  | { type: "quest:reopened"; data: unknown }
  | { type: "pr:opened"; data: unknown }
  | { type: "pr:merged"; data: unknown }
  | { type: "pr:closed"; data: unknown }
  | { type: "review:done"; data: unknown }
  | { type: "idea:new"; data: unknown }
  | { type: "idea:status"; data: unknown }
  | { type: "branch:push"; data: unknown }
  | { type: "roadmap:update"; data: unknown }
  | { type: "roadmap:done"; data: unknown }
  | { type: "score:update"; data: unknown }
  | { type: "achievement:unlock"; data: unknown };

class GameEventBus extends EventEmitter {
  private static instance: GameEventBus;

  private constructor() {
    super();
    this.setMaxListeners(100); // Support many SSE clients
  }

  static getInstance(): GameEventBus {
    if (!GameEventBus.instance) {
      GameEventBus.instance = new GameEventBus();
    }
    return GameEventBus.instance;
  }

  /**
   * Emit a typed game event
   */
  emitGameEvent(event: GameEvent) {
    this.emit(event.type, event.data);
    this.emit("*", event); // Wildcard listener for SSE broadcast
  }
}

// Singleton export
export const eventBus = GameEventBus.getInstance();
