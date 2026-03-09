import { ensureUser, recordScore } from "../../scoring/engine";
import { eventBus } from "../../realtime/event-bus";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function handlePullRequestEvent(payload: any) {
  const action = payload.action;
  const pr = payload.pull_request;
  const sender = payload.sender;

  if (!sender) return;
  await ensureUser(sender.login, sender.id, sender.avatar_url);

  // Handle pull_request_review events
  if (payload.review) {
    const review = payload.review;
    if (action === "submitted" && review.state === "approved") {
      await recordScore(
        review.user.login,
        "PR_REVIEW_GIVEN",
        5,
        `Reviewed PR #${pr.number}`,
        `pr#${pr.number}`,
        pr.html_url
      );

      eventBus.emit("*", {
        type: "review:done",
        data: {
          prNumber: pr.number,
          title: pr.title,
          reviewer: review.user.login,
        },
      });
    }
    return;
  }

  if (!pr) return;

  switch (action) {
    case "opened": {
      eventBus.emit("*", {
        type: "pr:opened",
        data: {
          prNumber: pr.number,
          title: pr.title,
          author: sender.login,
        },
      });
      break;
    }

    case "closed": {
      if (pr.merged) {
        // PR merged - award points to author
        await recordScore(
          pr.user.login,
          "PR_MERGED",
          15,
          `Merged PR #${pr.number}`,
          `pr#${pr.number}`,
          pr.html_url
        );

        eventBus.emit("*", {
          type: "pr:merged",
          data: {
            prNumber: pr.number,
            title: pr.title,
            author: pr.user.login,
          },
        });
      } else {
        eventBus.emit("*", {
          type: "pr:closed",
          data: {
            prNumber: pr.number,
            title: pr.title,
          },
        });
      }
      break;
    }
  }
}
