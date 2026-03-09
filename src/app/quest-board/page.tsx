import { QuestBoardPageClient } from "./QuestBoardClient";
import type { QuestBoard as QuestBoardType, Quest, QuestStatus, Difficulty } from "@/types/quest";
import { listIssues } from "@/lib/github/issues";
import { LABELS } from "@/lib/config";

function parseQuestFromIssue(issue: Awaited<ReturnType<typeof listIssues>>[number]): Quest {
  const labels = issue.labels?.map((l) => (typeof l === "string" ? l : l.name || "")) || [];

  let status: QuestStatus = "available";
  if (labels.includes(LABELS.QUEST.DONE)) status = "done";
  else if (labels.includes(LABELS.QUEST.REVIEW)) status = "review";
  else if (labels.includes(LABELS.QUEST.IN_PROGRESS)) status = "in-progress";
  else if (labels.includes(LABELS.QUEST.CLAIMED)) status = "claimed";

  let difficulty: Difficulty = "normal";
  if (labels.includes(LABELS.DIFFICULTY.EASY)) difficulty = "easy";
  else if (labels.includes(LABELS.DIFFICULTY.HARD)) difficulty = "hard";
  else if (labels.includes(LABELS.DIFFICULTY.EPIC)) difficulty = "epic";

  const pointsMap: Record<Difficulty, number> = { easy: 5, normal: 10, hard: 20, epic: 40 };

  let type: Quest["type"] = null;
  if (labels.includes(LABELS.TYPE.BUG)) type = "bug";
  else if (labels.includes(LABELS.TYPE.FEATURE)) type = "feature";
  else if (labels.includes(LABELS.TYPE.CHORE)) type = "chore";
  else if (labels.includes(LABELS.TYPE.DOCS)) type = "docs";

  return {
    issueNumber: issue.number,
    title: issue.title,
    body: issue.body || null,
    status,
    difficulty,
    type,
    basePoints: pointsMap[difficulty],
    bonusPoints: 0,
    claimedBy: issue.assignee?.login || null,
    claimedAt: null,
    completedAt: issue.closed_at || null,
    assignees: issue.assignees?.map((a) => a.login) || [],
    labels,
    milestoneTitle: issue.milestone?.title || null,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    htmlUrl: issue.html_url,
  };
}

export default async function QuestBoardPage() {
  let board: QuestBoardType = {
    available: [],
    claimed: [],
    inProgress: [],
    review: [],
    done: [],
  };

  try {
    const issues = await listIssues(undefined, "all");
    const quests = issues.map(parseQuestFromIssue);

    board = {
      available: quests.filter((q) => q.status === "available"),
      claimed: quests.filter((q) => q.status === "claimed"),
      inProgress: quests.filter((q) => q.status === "in-progress"),
      review: quests.filter((q) => q.status === "review"),
      done: quests.filter((q) => q.status === "done").slice(0, 20),
    };
  } catch (error) {
    console.error("Failed to load quest board:", error);
  }

  return <QuestBoardPageClient initialBoard={board} />;
}
