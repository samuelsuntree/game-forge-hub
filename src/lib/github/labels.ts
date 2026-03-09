import { getOctokit, getRepoParams } from "./client";
import { LABELS } from "../config";

// All labels that should exist in the repo
const ALL_LABELS = [
  { name: LABELS.QUEST.AVAILABLE, color: "0e8a16", description: "Task is available for claiming" },
  { name: LABELS.QUEST.CLAIMED, color: "fbca04", description: "Task has been claimed" },
  { name: LABELS.QUEST.IN_PROGRESS, color: "1d76db", description: "Task is in progress" },
  { name: LABELS.QUEST.REVIEW, color: "5319e7", description: "Task is under review" },
  { name: LABELS.QUEST.DONE, color: "0e8a16", description: "Task is completed" },
  { name: LABELS.DIFFICULTY.EASY, color: "c5def5", description: "Easy difficulty (5 pts)" },
  { name: LABELS.DIFFICULTY.NORMAL, color: "bfd4f2", description: "Normal difficulty (10 pts)" },
  { name: LABELS.DIFFICULTY.HARD, color: "d93f0b", description: "Hard difficulty (20 pts)" },
  { name: LABELS.DIFFICULTY.EPIC, color: "b60205", description: "Epic difficulty (40 pts)" },
  { name: LABELS.TYPE.BUG, color: "d73a4a", description: "Bug report" },
  { name: LABELS.TYPE.FEATURE, color: "a2eeef", description: "New feature" },
  { name: LABELS.TYPE.CHORE, color: "e4e669", description: "Maintenance task" },
  { name: LABELS.TYPE.DOCS, color: "0075ca", description: "Documentation" },
  { name: LABELS.IDEA.PROPOSED, color: "c2e0c6", description: "Idea proposed" },
  { name: LABELS.IDEA.DISCUSSING, color: "fef2c0", description: "Idea under discussion" },
  { name: LABELS.IDEA.ACCEPTED, color: "0e8a16", description: "Idea accepted" },
  { name: LABELS.IDEA.REJECTED, color: "e4e669", description: "Idea rejected" },
  { name: LABELS.IDEA.IMPLEMENTED, color: "0075ca", description: "Idea implemented" },
];

/**
 * Sync all required labels to the GitHub repo.
 * Creates missing labels, updates existing ones.
 */
export async function syncLabels() {
  const octokit = getOctokit();
  const params = getRepoParams();

  const { data: existing } = await octokit.rest.issues.listLabelsForRepo({
    ...params,
    per_page: 100,
  });

  const existingNames = new Set(existing.map((l) => l.name));

  for (const label of ALL_LABELS) {
    if (existingNames.has(label.name)) {
      await octokit.rest.issues.updateLabel({
        ...params,
        name: label.name,
        color: label.color,
        description: label.description,
      });
    } else {
      await octokit.rest.issues.createLabel({
        ...params,
        ...label,
      });
    }
  }

  return ALL_LABELS.length;
}
