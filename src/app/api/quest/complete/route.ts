import { NextRequest, NextResponse } from "next/server";
import { addLabels, removeLabel } from "@/lib/github/issues";
import { LABELS } from "@/lib/config";

export async function POST(request: NextRequest) {
  const { issueNumber } = await request.json();

  if (!issueNumber) {
    return NextResponse.json({ error: "issueNumber required" }, { status: 400 });
  }

  try {
    // Move labels: remove in-progress/review, add done
    await removeLabel(issueNumber, LABELS.QUEST.IN_PROGRESS);
    await removeLabel(issueNumber, LABELS.QUEST.REVIEW);
    await removeLabel(issueNumber, LABELS.QUEST.CLAIMED);
    await addLabels(issueNumber, [LABELS.QUEST.DONE]);

    // The actual scoring happens via the webhook when the issue is closed
    return NextResponse.json({ success: true, issueNumber });
  } catch (error) {
    console.error("Complete error:", error);
    return NextResponse.json({ error: "Failed to complete quest" }, { status: 500 });
  }
}
