import { NextRequest, NextResponse } from "next/server";
import { addAssignee, addLabels, removeLabel } from "@/lib/github/issues";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { LABELS } from "@/lib/config";

export async function POST(request: NextRequest) {
  const { issueNumber, username } = await request.json();

  if (!issueNumber || !username) {
    return NextResponse.json({ error: "issueNumber and username required" }, { status: 400 });
  }

  // Check WIP limit (skip if db unavailable)
  const db = getDb();
  if (db) {
    const user = db.select().from(users).where(eq(users.githubLogin, username)).get();
    if (user && user.currentWip >= user.wipLimit) {
      return NextResponse.json(
        { error: `WIP limit reached (${user.currentWip}/${user.wipLimit}). Complete or transfer a quest first.` },
        { status: 409 }
      );
    }
  }

  try {
    await addAssignee(issueNumber, username);
    await removeLabel(issueNumber, LABELS.QUEST.AVAILABLE);
    await addLabels(issueNumber, [LABELS.QUEST.CLAIMED]);

    return NextResponse.json({ success: true, issueNumber, claimedBy: username });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json({ error: "Failed to claim quest" }, { status: 500 });
  }
}
