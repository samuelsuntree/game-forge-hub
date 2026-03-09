import { NextRequest, NextResponse } from "next/server";
import { getOctokit, getRepoParams } from "@/lib/github/client";
import { LABELS } from "@/lib/config";
import type { Difficulty, QuestType } from "@/types/quest";

interface CreateQuestBody {
  title: string;
  description: string;
  difficulty: Difficulty;
  type: QuestType;
  milestone?: number;
  acceptanceCriteria?: string;
}

export async function POST(request: NextRequest) {
  const body: CreateQuestBody = await request.json();

  if (!body.title || !body.description) {
    return NextResponse.json(
      { error: "title and description are required" },
      { status: 400 }
    );
  }

  const octokit = getOctokit();
  const params = getRepoParams();

  // Build labels from difficulty and type
  const labels: string[] = [LABELS.QUEST.AVAILABLE];

  const difficultyLabel = `difficulty:${body.difficulty || "normal"}`;
  labels.push(difficultyLabel);

  if (body.type) {
    labels.push(`type:${body.type}`);
  }

  // Build issue body with optional acceptance criteria
  let issueBody = body.description;
  if (body.acceptanceCriteria) {
    issueBody += `\n\n## Acceptance Criteria\n${body.acceptanceCriteria}`;
  }

  try {
    const { data: issue } = await octokit.rest.issues.create({
      ...params,
      title: body.title,
      body: issueBody,
      labels,
      milestone: body.milestone || undefined,
    });

    return NextResponse.json({
      success: true,
      issueNumber: issue.number,
      htmlUrl: issue.html_url,
    });
  } catch (error) {
    console.error("Create quest error:", error);
    return NextResponse.json(
      { error: "Failed to create quest" },
      { status: 500 }
    );
  }
}
