/**
 * Lazy-loaded config — only validates when actually accessed at runtime,
 * not at module import time. This allows `next build` to succeed without
 * env vars set (pages that only use LABELS/DEFAULTS won't trigger validation).
 */
function getConfig() {
  return {
    get GITHUB_TOKEN() {
      const v = process.env.GITHUB_TOKEN;
      if (!v) throw new Error("GITHUB_TOKEN is not set");
      return v;
    },
    get GITHUB_OWNER() {
      const v = process.env.GITHUB_OWNER;
      if (!v) throw new Error("GITHUB_OWNER is not set");
      return v;
    },
    get GITHUB_REPO() {
      const v = process.env.GITHUB_REPO;
      if (!v) throw new Error("GITHUB_REPO is not set");
      return v;
    },
    get GITHUB_WEBHOOK_SECRET() {
      const v = process.env.GITHUB_WEBHOOK_SECRET;
      if (!v) throw new Error("GITHUB_WEBHOOK_SECRET is not set");
      return v;
    },
    get DATABASE_PATH() {
      return process.env.DATABASE_PATH || "./data/game-forge.db";
    },
  };
}

export const config = getConfig();

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
