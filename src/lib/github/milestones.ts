import { getOctokit, getRepoParams } from "./client";

export async function listMilestones(state: "open" | "closed" | "all" = "open") {
  const octokit = getOctokit();
  const params = getRepoParams();

  const { data } = await octokit.rest.issues.listMilestones({
    ...params,
    state,
    sort: "due_on",
    direction: "asc",
  });

  return data;
}

export async function getMilestone(milestoneNumber: number) {
  const octokit = getOctokit();
  const params = getRepoParams();

  const { data } = await octokit.rest.issues.getMilestone({
    ...params,
    milestone_number: milestoneNumber,
  });

  return data;
}

export async function getMilestoneIssues(milestoneNumber: number) {
  const octokit = getOctokit();
  const params = getRepoParams();

  const { data } = await octokit.rest.issues.listForRepo({
    ...params,
    milestone: milestoneNumber,
    state: "all",
    per_page: 100,
  });

  return data;
}
