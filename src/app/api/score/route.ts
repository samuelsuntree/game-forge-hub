import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const db = getDb();

  if (!db) {
    return NextResponse.json([]);
  }

  const leaderboard = db
    .select({
      githubLogin: users.githubLogin,
      avatarUrl: users.avatarUrl,
      displayName: users.displayName,
      totalScore: users.totalScore,
      currentWip: users.currentWip,
      wipLimit: users.wipLimit,
    })
    .from(users)
    .orderBy(desc(users.totalScore))
    .all();

  const ranked = leaderboard.map((user, index) => ({
    ...user,
    rank: index + 1,
  }));

  return NextResponse.json(ranked);
}
