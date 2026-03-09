import { NextRequest, NextResponse } from "next/server";
import { getOctokit, getRepoParams } from "@/lib/github/client";

export async function POST(request: NextRequest) {
  const { issueNumber, body: commentBody } = await request.json();

  if (!issueNumber || !commentBody) {
    return NextResponse.json(
      { error: "issueNumber and body are required" },
      { status: 400 }
    );
  }

  const octokit = getOctokit();
  const params = getRepoParams();

  try {
    const { data: comment } = await octokit.rest.issues.createComment({
      ...params,
      issue_number: issueNumber,
      body: commentBody,
    });

    return NextResponse.json({
      success: true,
      commentId: comment.id,
      htmlUrl: comment.html_url,
    });
  } catch (error) {
    console.error("Comment error:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const issueNumber = searchParams.get("issueNumber");

  if (!issueNumber) {
    return NextResponse.json({ error: "issueNumber required" }, { status: 400 });
  }

  const octokit = getOctokit();
  const params = getRepoParams();

  try {
    const { data: comments } = await octokit.rest.issues.listComments({
      ...params,
      issue_number: parseInt(issueNumber),
      per_page: 100,
    });

    return NextResponse.json(
      comments.map((c) => ({
        id: c.id,
        body: c.body,
        author: c.user?.login,
        authorAvatar: c.user?.avatar_url,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }))
    );
  } catch (error) {
    console.error("List comments error:", error);
    return NextResponse.json({ error: "Failed to list comments" }, { status: 500 });
  }
}
