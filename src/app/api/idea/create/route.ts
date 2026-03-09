import { NextRequest, NextResponse } from "next/server";
import { getOctokit, getRepoParams } from "@/lib/github/client";

interface CreateIdeaBody {
  title: string;
  context: string;
  proposal: string;
  consequences?: string;
  categoryId?: string;
}

export async function POST(request: NextRequest) {
  const body: CreateIdeaBody = await request.json();

  if (!body.title || !body.context || !body.proposal) {
    return NextResponse.json(
      { error: "title, context, and proposal are required" },
      { status: 400 }
    );
  }

  // Build ADR-formatted discussion body
  const discussionBody = `## Status
proposed

## Context
${body.context}

## Decision
${body.proposal}

## Consequences
${body.consequences || "_To be discussed._"}

---
_This idea was created via GameForgeHub._`;

  const octokit = getOctokit();
  const params = getRepoParams();

  try {
    // GitHub Discussions require GraphQL API
    // First, get the repository ID and category ID
    const repoQuery = await octokit.graphql<{
      repository: {
        id: string;
        discussionCategories: {
          nodes: { id: string; name: string }[];
        };
      };
    }>(`
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          id
          discussionCategories(first: 10) {
            nodes {
              id
              name
            }
          }
        }
      }
    `, {
      owner: params.owner,
      repo: params.repo,
    });

    const repoId = repoQuery.repository.id;

    // Use provided categoryId or find "Ideas" / "General" category
    let categoryId = body.categoryId;
    if (!categoryId) {
      const categories = repoQuery.repository.discussionCategories.nodes;
      const ideaCategory = categories.find(
        (c) => c.name.toLowerCase() === "ideas" || c.name.toLowerCase() === "general"
      );
      categoryId = ideaCategory?.id || categories[0]?.id;
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: "No discussion categories found. Enable Discussions in your GitHub repo." },
        { status: 400 }
      );
    }

    const result = await octokit.graphql<{
      createDiscussion: {
        discussion: { number: number; url: string };
      };
    }>(`
      mutation($repoId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
        createDiscussion(input: {
          repositoryId: $repoId,
          categoryId: $categoryId,
          title: $title,
          body: $body
        }) {
          discussion {
            number
            url
          }
        }
      }
    `, {
      repoId,
      categoryId,
      title: body.title,
      body: discussionBody,
    });

    return NextResponse.json({
      success: true,
      discussionNumber: result.createDiscussion.discussion.number,
      url: result.createDiscussion.discussion.url,
    });
  } catch (error) {
    console.error("Create idea error:", error);
    return NextResponse.json({ error: "Failed to create idea" }, { status: 500 });
  }
}
