import { getOctokit, getRepoParams } from "./client";

export async function listIssues(labels?: string, state: "open" | "closed" | "all" = "open") {
  const octokit = getOctokit();
  const params = getRepoParams();

  const { data } = await octokit.rest.issues.listForRepo({
    ...params,
    state,
    labels,
    per_page: 100,
    sort: "updated",
    direction: "desc",
  });

  // Filter out pull requests (GitHub API returns PRs as issues)
  return data.filter((issue) => !issue.pull_request);
}

export async function getIssue(issueNumber: number) {
  const octokit = getOctokit();
  const params = getRepoParams();

  const { data } = await octokit.rest.issues.get({
    ...params,
    issue_number: issueNumber,
  });

  return data;
}

export async function addAssignee(issueNumber: number, username: string) {
  const octokit = getOctokit();
  const params = getRepoParams();

  await octokit.rest.issues.addAssignees({
    ...params,
    issue_number: issueNumber,
    assignees: [username],
  });
}

export async function removeAssignee(issueNumber: number, username: string) {
  const octokit = getOctokit();
  const params = getRepoParams();

  await octokit.rest.issues.removeAssignees({
    ...params,
    issue_number: issueNumber,
    assignees: [username],
  });
}

export async function replaceLabels(issueNumber: number, labels: string[]) {
  const octokit = getOctokit();
  const params = getRepoParams();

  await octokit.rest.issues.setLabels({
    ...params,
    issue_number: issueNumber,
    labels,
  });
}

export async function addLabels(issueNumber: number, labels: string[]) {
  const octokit = getOctokit();
  const params = getRepoParams();

  await octokit.rest.issues.addLabels({
    ...params,
    issue_number: issueNumber,
    labels,
  });
}

export async function removeLabel(issueNumber: number, label: string) {
  const octokit = getOctokit();
  const params = getRepoParams();

  try {
    await octokit.rest.issues.removeLabel({
      ...params,
      issue_number: issueNumber,
      name: label,
    });
  } catch {
    // Label might not exist, ignore
  }
}
