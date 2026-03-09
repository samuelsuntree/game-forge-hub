export type QuestStatus = "available" | "claimed" | "in-progress" | "review" | "done";
export type Difficulty = "easy" | "normal" | "hard" | "epic";
export type QuestType = "bug" | "feature" | "chore" | "docs";

export interface Quest {
  issueNumber: number;
  title: string;
  body: string | null;
  status: QuestStatus;
  difficulty: Difficulty;
  type: QuestType | null;
  basePoints: number;
  bonusPoints: number;
  claimedBy: string | null;
  claimedAt: string | null;
  completedAt: string | null;
  assignees: string[];
  labels: string[];
  milestoneTitle: string | null;
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
}

export interface QuestBoard {
  available: Quest[];
  claimed: Quest[];
  inProgress: Quest[];
  review: Quest[];
  done: Quest[];
}

export interface ClaimRequest {
  issueNumber: number;
  username: string;
}

export interface TransferRequest {
  issueNumber: number;
  fromUser: string;
  toUser: string;
}
