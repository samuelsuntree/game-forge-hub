import { ensureUser, onQuestClaimed, onQuestCompleted, recordScore } from "../../scoring/engine";
import { eventBus } from "../../realtime/event-bus";
import { LABELS } from "../../config";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function handleIssueEvent(payload: any) {
  const action = payload.action;
  const issue = payload.issue;
  const sender = payload.sender;

  if (!issue || !sender) return;

  // Ensure sender exists in our DB
  await ensureUser(sender.login, sender.id, sender.avatar_url);

  const labels = (issue.labels || []).map((l: any) => l.name);
  const isQuest = labels.some((l: string) => l.startsWith("quest:"));

  switch (action) {
    case "opened": {
      if (isQuest) {
        eventBus.emit("*", {
          type: "quest:new",
          data: {
            issueNumber: issue.number,
            title: issue.title,
            author: sender.login,
          },
        });
      }

      // Bug report scoring
      if (labels.includes(LABELS.TYPE.BUG)) {
        await recordScore(
          sender.login,
          "BUG_REPORTED",
          3,
          `Reported bug #${issue.number}`,
          `issue#${issue.number}`,
          issue.html_url
        );
      }
      break;
    }

    case "assigned": {
      const assignee = payload.assignee;
      if (assignee && isQuest) {
        await ensureUser(assignee.login, assignee.id, assignee.avatar_url);
        await onQuestClaimed(assignee.login, issue.number, issue.html_url);

        eventBus.emit("*", {
          type: "quest:claimed",
          data: {
            issueNumber: issue.number,
            title: issue.title,
            claimedBy: assignee.login,
          },
        });
      }
      break;
    }

    case "unassigned": {
      const unassigned = payload.assignee;
      if (unassigned) {
        eventBus.emit("*", {
          type: "quest:released",
          data: {
            issueNumber: issue.number,
            title: issue.title,
            releasedBy: unassigned.login,
          },
        });
      }
      break;
    }

    case "closed": {
      if (isQuest) {
        // Credit the assignee (or closer if no assignee)
        const completedBy = issue.assignee?.login || sender.login;
        await ensureUser(completedBy, issue.assignee?.id || sender.id);
        await onQuestCompleted(completedBy, issue.number, issue.html_url);

        eventBus.emit("*", {
          type: "quest:done",
          data: {
            issueNumber: issue.number,
            title: issue.title,
            completedBy,
          },
        });
      }
      break;
    }

    case "labeled": {
      const label = payload.label;
      if (label && label.name.startsWith("quest:")) {
        eventBus.emit("*", {
          type: "quest:moved",
          data: {
            issueNumber: issue.number,
            title: issue.title,
            newStatus: label.name.replace("quest:", ""),
          },
        });
      }
      if (label && label.name.startsWith("idea:")) {
        eventBus.emit("*", {
          type: "idea:status",
          data: {
            issueNumber: issue.number,
            title: issue.title,
            newStatus: label.name.replace("idea:", ""),
          },
        });
      }
      break;
    }

    case "reopened": {
      if (isQuest) {
        eventBus.emit("*", {
          type: "quest:reopened",
          data: {
            issueNumber: issue.number,
            title: issue.title,
          },
        });
      }
      break;
    }
  }
}
