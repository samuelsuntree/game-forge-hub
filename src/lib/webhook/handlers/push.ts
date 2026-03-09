import { eventBus } from "../../realtime/event-bus";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function handlePushEvent(payload: any) {
  const ref = payload.ref; // "refs/heads/branch-name"
  const branch = ref?.replace("refs/heads/", "");
  const sender = payload.sender;
  const commits = payload.commits || [];

  if (!branch || !sender) return;

  eventBus.emit("*", {
    type: "branch:push",
    data: {
      branch,
      pusher: sender.login,
      commitCount: commits.length,
      headCommit: payload.head_commit?.message || null,
    },
  });
}
