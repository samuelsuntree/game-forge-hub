import { eq, sql } from "drizzle-orm";
import { getDb } from "../db/client";
import { users, scoreEvents, achievements, questMeta } from "../db/schema";
import { getCompletionPoints, calculateSpeedBonus } from "./rules";
import { eventBus } from "../realtime/event-bus";
import type { Difficulty } from "@/types/quest";
import type { ScoreEventType } from "@/types/score";

/**
 * Ensure a user exists in the local DB, create if not found.
 */
export async function ensureUser(githubLogin: string, githubId: number, avatarUrl?: string) {
  const db = getDb();
  if (!db) return null;

  const existing = db
    .select()
    .from(users)
    .where(eq(users.githubLogin, githubLogin))
    .get();

  if (existing) return existing;

  const result = db
    .insert(users)
    .values({
      githubLogin,
      githubId,
      avatarUrl: avatarUrl || null,
      displayName: githubLogin,
    })
    .returning()
    .get();

  return result;
}

/**
 * Record a scoring event and update the user's total score.
 */
export async function recordScore(
  githubLogin: string,
  eventType: ScoreEventType,
  points: number,
  reason: string,
  githubRef?: string,
  githubRefUrl?: string
) {
  const db = getDb();
  if (!db) return;

  const user = db
    .select()
    .from(users)
    .where(eq(users.githubLogin, githubLogin))
    .get();

  if (!user) return;

  db.insert(scoreEvents)
    .values({
      userId: user.id,
      eventType,
      points,
      reason,
      githubRef: githubRef || null,
      githubRefUrl: githubRefUrl || null,
    })
    .run();

  db.update(users)
    .set({
      totalScore: sql`${users.totalScore} + ${points}`,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, user.id))
    .run();

  // Broadcast score update via SSE
  eventBus.emit("score:update", {
    username: githubLogin,
    eventType,
    points,
    reason,
    newTotal: user.totalScore + points,
  });

  // Check achievements after score update
  await checkAchievements(githubLogin);
}

/**
 * Handle quest claim scoring
 */
export async function onQuestClaimed(
  githubLogin: string,
  issueNumber: number,
  issueUrl: string
) {
  const db = getDb();
  if (!db) return;

  // Update WIP count
  db.update(users)
    .set({ currentWip: sql`${users.currentWip} + 1` })
    .where(eq(users.githubLogin, githubLogin))
    .run();

  // Update quest meta
  const existing = db
    .select()
    .from(questMeta)
    .where(eq(questMeta.issueNumber, issueNumber))
    .get();

  if (existing) {
    db.update(questMeta)
      .set({ claimedBy: githubLogin, claimedAt: new Date().toISOString() })
      .where(eq(questMeta.issueNumber, issueNumber))
      .run();
  } else {
    db.insert(questMeta)
      .values({
        issueNumber,
        claimedBy: githubLogin,
        claimedAt: new Date().toISOString(),
      })
      .run();
  }

  await recordScore(
    githubLogin,
    "QUEST_CLAIMED",
    2,
    `Claimed quest #${issueNumber}`,
    `issue#${issueNumber}`,
    issueUrl
  );
}

/**
 * Handle quest completion scoring
 */
export async function onQuestCompleted(
  githubLogin: string,
  issueNumber: number,
  issueUrl: string
) {
  const db = getDb();
  if (!db) return;

  // Get quest meta for difficulty and timing
  const meta = db
    .select()
    .from(questMeta)
    .where(eq(questMeta.issueNumber, issueNumber))
    .get();

  const difficulty = (meta?.difficulty || "normal") as Difficulty;
  const { eventType, points } = getCompletionPoints(difficulty);

  // Update WIP count
  db.update(users)
    .set({ currentWip: sql`MAX(${users.currentWip} - 1, 0)` })
    .where(eq(users.githubLogin, githubLogin))
    .run();

  // Update quest meta
  const now = new Date().toISOString();
  if (meta) {
    db.update(questMeta)
      .set({ completedAt: now })
      .where(eq(questMeta.issueNumber, issueNumber))
      .run();
  }

  // Base completion points
  await recordScore(
    githubLogin,
    eventType,
    points + (meta?.bonusPoints || 0),
    `Completed ${difficulty} quest #${issueNumber}`,
    `issue#${issueNumber}`,
    issueUrl
  );

  // Speed bonus
  if (meta?.claimedAt) {
    const bonus = calculateSpeedBonus(
      new Date(meta.claimedAt),
      new Date(),
      difficulty
    );
    if (bonus > 0) {
      await recordScore(
        githubLogin,
        "SPEED_BONUS",
        bonus,
        `Speed bonus for quest #${issueNumber}`,
        `issue#${issueNumber}`,
        issueUrl
      );
    }
  }
}

/**
 * Check and unlock achievements
 */
async function checkAchievements(githubLogin: string) {
  const db = getDb();
  if (!db) return;

  const user = db
    .select()
    .from(users)
    .where(eq(users.githubLogin, githubLogin))
    .get();

  if (!user) return;

  const existingAchievements = db
    .select()
    .from(achievements)
    .where(eq(achievements.userId, user.id))
    .all();

  const unlocked = new Set(existingAchievements.map((a) => a.achievementKey));

  const completedQuests = db
    .select()
    .from(scoreEvents)
    .where(eq(scoreEvents.userId, user.id))
    .all()
    .filter((e) => e.eventType.startsWith("QUEST_COMPLETED"));

  // first_blood: complete first quest
  if (!unlocked.has("first_blood") && completedQuests.length >= 1) {
    await unlockAchievement(user.id, "first_blood", githubLogin);
  }

  // century: reach 100 points
  if (!unlocked.has("century") && user.totalScore >= 100) {
    await unlockAchievement(user.id, "century", githubLogin);
  }

  // bug_hunter_10: fix 10 bugs
  const bugFixes = db
    .select()
    .from(scoreEvents)
    .where(eq(scoreEvents.userId, user.id))
    .all()
    .filter((e) => e.reason?.includes("bug") || e.eventType === "BUG_REPORTED");

  if (!unlocked.has("bug_hunter_10") && bugFixes.length >= 10) {
    await unlockAchievement(user.id, "bug_hunter_10", githubLogin);
  }

  // review_master_20: 20 code reviews
  const reviews = db
    .select()
    .from(scoreEvents)
    .where(eq(scoreEvents.userId, user.id))
    .all()
    .filter((e) => e.eventType === "PR_REVIEW_GIVEN");

  if (!unlocked.has("review_master_20") && reviews.length >= 20) {
    await unlockAchievement(user.id, "review_master_20", githubLogin);
  }

  // speed_demon: any speed bonus >= max
  const speedBonuses = db
    .select()
    .from(scoreEvents)
    .where(eq(scoreEvents.userId, user.id))
    .all()
    .filter((e) => e.eventType === "SPEED_BONUS" && e.points >= 15);

  if (!unlocked.has("speed_demon") && speedBonuses.length >= 1) {
    await unlockAchievement(user.id, "speed_demon", githubLogin);
  }
}

async function unlockAchievement(userId: number, key: string, githubLogin: string) {
  const db = getDb();
  if (!db) return;

  try {
    db.insert(achievements)
      .values({ userId, achievementKey: key })
      .run();

    eventBus.emit("achievement:unlock", {
      username: githubLogin,
      achievementKey: key,
    });
  } catch {
    // Already unlocked (unique constraint), ignore
  }
}
