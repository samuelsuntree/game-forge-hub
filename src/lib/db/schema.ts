import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  githubLogin: text("github_login").notNull().unique(),
  githubId: integer("github_id").notNull().unique(),
  avatarUrl: text("avatar_url"),
  displayName: text("display_name"),
  totalScore: integer("total_score").notNull().default(0),
  currentWip: integer("current_wip").notNull().default(0),
  wipLimit: integer("wip_limit").notNull().default(3),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const scoreEvents = sqliteTable("score_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  eventType: text("event_type").notNull(),
  points: integer("points").notNull(),
  reason: text("reason"),
  githubRef: text("github_ref"),
  githubRefUrl: text("github_ref_url"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const achievements = sqliteTable(
  "achievements",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id),
    achievementKey: text("achievement_key").notNull(),
    unlockedAt: text("unlocked_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("user_achievement_unique").on(table.userId, table.achievementKey),
  ]
);

export const questMeta = sqliteTable("quest_meta", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueNumber: integer("issue_number").notNull().unique(),
  difficulty: text("difficulty").notNull().default("normal"),
  basePoints: integer("base_points").notNull().default(10),
  bonusPoints: integer("bonus_points").notNull().default(0),
  claimedBy: text("claimed_by"),
  claimedAt: text("claimed_at"),
  completedAt: text("completed_at"),
  transferredCount: integer("transferred_count").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const dailySnapshots = sqliteTable(
  "daily_snapshots",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    snapshotDate: text("snapshot_date").notNull(),
    milestoneId: integer("milestone_id"),
    openIssues: integer("open_issues").notNull().default(0),
    closedIssues: integer("closed_issues").notNull().default(0),
    openPrs: integer("open_prs").notNull().default(0),
    mergedPrs: integer("merged_prs").notNull().default(0),
    contributors: text("contributors"), // JSON array
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("snapshot_date_milestone_unique").on(table.snapshotDate, table.milestoneId),
  ]
);
