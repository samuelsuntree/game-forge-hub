import { NextRequest, NextResponse } from "next/server";
import { getOctokit, getRepoParams } from "@/lib/github/client";
import { LABELS } from "@/lib/config";

interface UpdateQuestBody {
  issueNumber: number;
  title?: string;
  description?: string;
  difficulty?: string;
  status?: string;
  assignee?: string | null;
  milestone?: number | null;
}

export async function PATCH(request: NextRequest) {
  const body: UpdateQuestBody = await request.json();

  if (!body.issueNumber) {
    return NextResponse.json({ error: "issueNumber required" }, { status: 400 });
  }

  const octokit = getOctokit();
  const params = getRepoParams();
  const issueNumber = body.issueNumber;

  try {
    // Update basic fields if provided
    const updateFields: Record<string, unknown> = {};
    if (body.title) updateFields.title = body.title;
    if (body.description) updateFields.body = body.description;
    if (body.milestone !== undefined) updateFields.milestone = body.milestone;

    if (Object.keys(updateFields).length > 0) {
      await octokit.rest.issues.update({
        ...params,
        issue_number: issueNumber,
        ...updateFields,
      });
    }

    // Update assignee if provided
    if (body.assignee !== undefined) {
      if (body.assignee) {
        await octokit.rest.issues.addAssignees({
          ...params,
          issue_number: issueNumber,
          assignees: [body.assignee],
        });
      } else {
        // Get current assignees and remove all
        const { data: issue } = await octokit.rest.issues.get({
          ...params,
          issue_number: issueNumber,
        });
        if (issue.assignees && issue.assignees.length > 0) {
          await octokit.rest.issues.removeAssignees({
            ...params,
            issue_number: issueNumber,
            assignees: issue.assignees.map((a) => a.login),
          });
        }
      }
    }

    // Update labels if difficulty or status changed
    if (body.difficulty || body.status) {
      const { data: issue } = await octokit.rest.issues.get({
        ...params,
        issue_number: issueNumber,
      });

      const currentLabels = issue.labels
        .map((l) => (typeof l === "string" ? l : l.name || ""))
        .filter(Boolean);

      let newLabels = [...currentLabels];

      if (body.difficulty) {
        // Remove old difficulty labels, add new one
        newLabels = newLabels.filter((l) => !l.startsWith("difficulty:"));
        newLabels.push(`difficulty:${body.difficulty}`);
      }

      if (body.status) {
        // Remove old quest status labels, add new one
        newLabels = newLabels.filter((l) => !l.startsWith("quest:"));
        const statusLabel = LABELS.QUEST[body.status.toUpperCase().replace("-", "_") as keyof typeof LABELS.QUEST];
        if (statusLabel) {
          newLabels.push(statusLabel);
        }
      }

      await octokit.rest.issues.setLabels({
        ...params,
        issue_number: issueNumber,
        labels: newLabels,
      });
    }

    return NextResponse.json({ success: true, issueNumber });
  } catch (error) {
    console.error("Update quest error:", error);
    return NextResponse.json({ error: "Failed to update quest" }, { status: 500 });
  }
}
