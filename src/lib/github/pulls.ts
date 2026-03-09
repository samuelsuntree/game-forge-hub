import { getOctokit, getRepoParams } from "./client";

export async function listPulls(state: "open" | "closed" | "all" = "open") {
  const octokit = getOctokit();
  const params = getRepoParams();

  const { data } = await octokit.rest.pulls.list({
    ...params,
    state,
    per_page: 100,
    sort: "updated",
    direction: "desc",
  });

  return data;
}

export async function getPull(pullNumber: number) {
  const octokit = getOctokit();
  const params = getRepoParams();

  const { data } = await octokit.rest.pulls.get({
    ...params,
    pull_number: pullNumber,
  });

  return data;
}

export async function listReviews(pullNumber: number) {
  const octokit = getOctokit();
  const params = getRepoParams();

  const { data } = await octokit.rest.pulls.listReviews({
    ...params,
    pull_number: pullNumber,
  });

  return data;
}
