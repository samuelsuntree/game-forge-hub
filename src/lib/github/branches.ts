import { getOctokit, getRepoParams } from "./client";

export async function listBranches() {
  const octokit = getOctokit();
  const params = getRepoParams();

  const { data } = await octokit.rest.repos.listBranches({
    ...params,
    per_page: 100,
  });

  return data;
}

export async function compareBranches(base: string, head: string) {
  const octokit = getOctokit();
  const params = getRepoParams();

  const { data } = await octokit.rest.repos.compareCommits({
    ...params,
    base,
    head,
  });

  return {
    aheadBy: data.ahead_by,
    behindBy: data.behind_by,
    totalCommits: data.total_commits,
    status: data.status, // "ahead" | "behind" | "diverged" | "identical"
  };
}
