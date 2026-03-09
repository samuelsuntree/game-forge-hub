import { NextRequest, NextResponse } from "next/server";
import { getOctokit, getRepoParams } from "@/lib/github/client";

export async function GET() {
  const octokit = getOctokit();
  const params = getRepoParams();

  try {
    const { data } = await octokit.rest.issues.listMilestones({
      ...params,
      state: "all",
      sort: "due_on",
      direction: "asc",
    });

    return NextResponse.json(
      data.map((m) => ({
        number: m.number,
        title: m.title,
        description: m.description,
        state: m.state,
        dueOn: m.due_on,
        openIssues: m.open_issues,
        closedIssues: m.closed_issues,
      }))
    );
  } catch (error) {
    console.error("List milestones error:", error);
    return NextResponse.json({ error: "Failed to list milestones" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { title, description, dueOn } = await request.json();

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const octokit = getOctokit();
  const params = getRepoParams();

  try {
    const { data } = await octokit.rest.issues.createMilestone({
      ...params,
      title,
      description: description || undefined,
      due_on: dueOn || undefined,
    });

    return NextResponse.json({
      success: true,
      number: data.number,
      title: data.title,
    });
  } catch (error) {
    console.error("Create milestone error:", error);
    return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
  }
}
