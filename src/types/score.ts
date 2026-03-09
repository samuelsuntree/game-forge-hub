export type ScoreEventType =
  | "QUEST_CLAIMED"
  | "QUEST_COMPLETED_EASY"
  | "QUEST_COMPLETED_NORMAL"
  | "QUEST_COMPLETED_HARD"
  | "QUEST_COMPLETED_EPIC"
  | "QUEST_TRANSFERRED_OUT"
  | "PR_MERGED"
  | "PR_REVIEW_GIVEN"
  | "IDEA_PROPOSED"
  | "IDEA_ACCEPTED"
  | "BUG_REPORTED"
  | "DAILY_STREAK_BONUS"
  | "SPEED_BONUS";

export interface ScoreEvent {
  id: number;
  userId: number;
  eventType: ScoreEventType;
  points: number;
  reason: string;
  githubRef: string | null;
  githubRefUrl: string | null;
  createdAt: string;
}

export interface UserScore {
  githubLogin: string;
  avatarUrl: string;
  displayName: string;
  totalScore: number;
  currentWip: number;
  wipLimit: number;
  rank: number;
}

export type AchievementKey =
  | "first_blood"
  | "bug_hunter_10"
  | "idea_machine_5"
  | "review_master_20"
  | "speed_demon"
  | "team_player"
  | "streak_7"
  | "century";

export interface Achievement {
  key: AchievementKey;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
}
