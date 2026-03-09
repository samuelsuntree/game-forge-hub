import { ensureUser, recordScore } from "../../scoring/engine";
import { eventBus } from "../../realtime/event-bus";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function handleDiscussionEvent(payload: any) {
  const action = payload.action;
  const discussion = payload.discussion;
  const sender = payload.sender;

  if (!discussion || !sender) return;
  await ensureUser(sender.login, sender.id, sender.avatar_url);

  const labels = (discussion.labels || []).map((l: any) => l.name);
  const isIdea = labels.some((l: string) => l.startsWith("idea:"));

  switch (action) {
    case "created": {
      if (isIdea) {
        await recordScore(
          sender.login,
          "IDEA_PROPOSED",
          3,
          `Proposed idea: ${discussion.title}`,
          `discussion#${discussion.number}`,
          discussion.html_url
        );

        eventBus.emit("*", {
          type: "idea:new",
          data: {
            discussionId: discussion.number,
            title: discussion.title,
            author: sender.login,
          },
        });
      }
      break;
    }

    case "labeled": {
      const label = payload.label;
      if (label?.name === "idea:accepted") {
        await recordScore(
          discussion.user.login,
          "IDEA_ACCEPTED",
          10,
          `Idea accepted: ${discussion.title}`,
          `discussion#${discussion.number}`,
          discussion.html_url
        );
      }

      if (label?.name.startsWith("idea:")) {
        eventBus.emit("*", {
          type: "idea:status",
          data: {
            discussionId: discussion.number,
            title: discussion.title,
            newStatus: label.name.replace("idea:", ""),
          },
        });
      }
      break;
    }
  }
}
