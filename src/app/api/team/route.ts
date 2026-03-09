import { NextResponse } from "next/server";
import { getOctokit, getRepoParams } from "@/lib/github/client";

/**
 * List team members (repo collaborators).
 * Used by dropdowns for assigning quests, transferring, etc.
 */
export async function GET() {
  const octokit = getOctokit();
  const params = getRepoParams();

  try {
    const { data } = await octokit.rest.repos.listCollaborators({
      ...params,
      per_page: 100,
    });

    return NextResponse.json(
      data.map((u) => ({
        login: u.login,
        avatarUrl: u.avatar_url,
        role: u.role_name,
      }))
    );
  } catch (error) {
    console.error("List team error:", error);
    return NextResponse.json({ error: "Failed to list team members" }, { status: 500 });
  }
}
