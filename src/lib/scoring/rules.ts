import type { Difficulty } from "@/types/quest";
import type { ScoreEventType } from "@/types/score";
import { DEFAULTS } from "../config";

const { POINTS } = DEFAULTS;

export function getCompletionPoints(difficulty: Difficulty): {
  eventType: ScoreEventType;
  points: number;
} {
  switch (difficulty) {
    case "easy":
      return { eventType: "QUEST_COMPLETED_EASY", points: POINTS.QUEST_COMPLETED_EASY };
    case "normal":
      return { eventType: "QUEST_COMPLETED_NORMAL", points: POINTS.QUEST_COMPLETED_NORMAL };
    case "hard":
      return { eventType: "QUEST_COMPLETED_HARD", points: POINTS.QUEST_COMPLETED_HARD };
    case "epic":
      return { eventType: "QUEST_COMPLETED_EPIC", points: POINTS.QUEST_COMPLETED_EPIC };
  }
}

export function calculateSpeedBonus(
  claimedAt: Date,
  completedAt: Date,
  difficulty: Difficulty
): number {
  const hoursSpent = (completedAt.getTime() - claimedAt.getTime()) / (1000 * 60 * 60);

  // Expected hours by difficulty
  const expectedHours: Record<Difficulty, number> = {
    easy: 8,
    normal: 24,
    hard: 72,
    epic: 168,
  };

  const expected = expectedHours[difficulty];
  const ratio = hoursSpent / expected;

  if (ratio <= 0.5) return POINTS.SPEED_BONUS_MAX; // Under half time
  if (ratio <= 0.75) return POINTS.SPEED_BONUS_MIN + 5; // Under 75%
  if (ratio <= 1.0) return POINTS.SPEED_BONUS_MIN; // On time

  return 0; // Over time, no bonus
}

export const ACHIEVEMENT_DEFINITIONS: Record<
  string,
  { name: string; description: string }
> = {
  first_blood: { name: "First Blood", description: "Complete your first quest" },
  bug_hunter_10: { name: "Bug Hunter", description: "Fix 10 bugs" },
  idea_machine_5: { name: "Idea Machine", description: "Get 5 ideas accepted" },
  review_master_20: { name: "Review Master", description: "Complete 20 code reviews" },
  speed_demon: { name: "Speed Demon", description: "Complete a quest in under 50% estimated time" },
  team_player: { name: "Team Player", description: "Collaborate on 5 quests" },
  streak_7: { name: "On Fire", description: "7-day activity streak" },
  century: { name: "Centurion", description: "Reach 100 total points" },
};
