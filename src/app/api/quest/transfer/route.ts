import { NextRequest, NextResponse } from "next/server";
import { addAssignee, removeAssignee } from "@/lib/github/issues";
import { recordScore, ensureUser } from "@/lib/scoring/engine";
import { getDb } from "@/lib/db/client";
import { questMeta } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const { issueNumber, fromUser, toUser } = await request.json();

  if (!issueNumber || !fromUser || !toUser) {
    return NextResponse.json(
      { error: "issueNumber, fromUser, and toUser required" },
      { status: 400 }
    );
  }

  try {
    await removeAssignee(issueNumber, fromUser);
    await addAssignee(issueNumber, toUser);

    await recordScore(
      fromUser,
      "QUEST_TRANSFERRED_OUT",
      -1,
      `Transferred quest #${issueNumber} to ${toUser}`,
      `issue#${issueNumber}`
    );

    await ensureUser(toUser, 0);

    const db = getDb();
    if (db) {
      db.update(questMeta)
        .set({
          claimedBy: toUser,
          claimedAt: new Date().toISOString(),
          transferredCount: sql`${questMeta.transferredCount} + 1`,
        })
        .where(eq(questMeta.issueNumber, issueNumber))
        .run();
    }

    return NextResponse.json({ success: true, issueNumber, from: fromUser, to: toUser });
  } catch (error) {
    console.error("Transfer error:", error);
    return NextResponse.json({ error: "Failed to transfer quest" }, { status: 500 });
  }
}
