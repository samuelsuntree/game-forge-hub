import { handleIssueEvent } from "./handlers/issues";
import { handlePullRequestEvent } from "./handlers/pull-request";
import { handlePushEvent } from "./handlers/push";
import { handleDiscussionEvent } from "./handlers/discussion";

export type WebhookEvent = {
  event: string;
  action?: string;
  payload: Record<string, unknown>;
};

/**
 * Route incoming webhook events to the appropriate handler.
 */
export async function routeWebhookEvent({ event, payload }: WebhookEvent) {
  switch (event) {
    case "issues":
      return handleIssueEvent(payload);

    case "pull_request":
      return handlePullRequestEvent(payload);

    case "pull_request_review":
      return handlePullRequestEvent(payload);

    case "push":
      return handlePushEvent(payload);

    case "discussion":
      return handleDiscussionEvent(payload);

    case "milestone":
      // Broadcast roadmap update
      const { eventBus } = await import("../realtime/event-bus");
      eventBus.emit("*", {
        type: payload.action === "closed" ? "roadmap:done" : "roadmap:update",
        data: payload,
      });
      return;

    default:
      console.log(`Unhandled webhook event: ${event}`);
  }
}
