import { z } from "zod";

const envSchema = z.object({
  GITHUB_TOKEN: z.string().min(1),
  GITHUB_OWNER: z.string().min(1),
  GITHUB_REPO: z.string().min(1),
  GITHUB_WEBHOOK_SECRET: z.string().min(1),
  DATABASE_PATH: z.string().default("./data/game-forge.db"),
});

function loadConfig() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Missing environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration");
  }
  return parsed.data;
}

export const config = loadConfig();

// WIP limits and scoring defaults
export const DEFAULTS = {
  WIP_LIMIT: 3,
  POINTS: {
    QUEST_CLAIMED: 2,
    QUEST_COMPLETED_EASY: 5,
    QUEST_COMPLETED_NORMAL: 10,
    QUEST_COMPLETED_HARD: 20,
    QUEST_COMPLETED_EPIC: 40,
    QUEST_TRANSFERRED_OUT: -1,
    PR_MERGED: 15,
    PR_REVIEW_GIVEN: 5,
    IDEA_PROPOSED: 3,
    IDEA_ACCEPTED: 10,
    BUG_REPORTED: 3,
    DAILY_STREAK_BONUS: 5,
    SPEED_BONUS_MIN: 5,
    SPEED_BONUS_MAX: 15,
  },
} as const;

// GitHub label conventions (labels = protocol)
export const LABELS = {
  QUEST: {
    AVAILABLE: "quest:available",
    CLAIMED: "quest:claimed",
    IN_PROGRESS: "quest:in-progress",
    REVIEW: "quest:review",
    DONE: "quest:done",
  },
  DIFFICULTY: {
    EASY: "difficulty:easy",
    NORMAL: "difficulty:normal",
    HARD: "difficulty:hard",
    EPIC: "difficulty:epic",
  },
  TYPE: {
    BUG: "type:bug",
    FEATURE: "type:feature",
    CHORE: "type:chore",
    DOCS: "type:docs",
  },
  IDEA: {
    PROPOSED: "idea:proposed",
    DISCUSSING: "idea:discussing",
    ACCEPTED: "idea:accepted",
    REJECTED: "idea:rejected",
    IMPLEMENTED: "idea:implemented",
  },
} as const;
