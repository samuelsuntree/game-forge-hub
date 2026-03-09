import { Octokit } from "octokit";
import { config } from "dotenv";

config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;

const ALL_LABELS = [
  { name: "quest:available", color: "0e8a16", description: "Task is available for claiming" },
  { name: "quest:claimed", color: "fbca04", description: "Task has been claimed" },
  { name: "quest:in-progress", color: "1d76db", description: "Task is in progress" },
  { name: "quest:review", color: "5319e7", description: "Task is under review" },
  { name: "quest:done", color: "0e8a16", description: "Task is completed" },
  { name: "difficulty:easy", color: "c5def5", description: "Easy difficulty (5 pts)" },
  { name: "difficulty:normal", color: "bfd4f2", description: "Normal difficulty (10 pts)" },
  { name: "difficulty:hard", color: "d93f0b", description: "Hard difficulty (20 pts)" },
  { name: "difficulty:epic", color: "b60205", description: "Epic difficulty (40 pts)" },
  { name: "type:bug", color: "d73a4a", description: "Bug report" },
  { name: "type:feature", color: "a2eeef", description: "New feature" },
  { name: "type:chore", color: "e4e669", description: "Maintenance task" },
  { name: "type:docs", color: "0075ca", description: "Documentation" },
  { name: "idea:proposed", color: "c2e0c6", description: "Idea proposed" },
  { name: "idea:discussing", color: "fef2c0", description: "Idea under discussion" },
  { name: "idea:accepted", color: "0e8a16", description: "Idea accepted" },
  { name: "idea:rejected", color: "e4e669", description: "Idea rejected" },
  { name: "idea:implemented", color: "0075ca", description: "Idea implemented" },
];

async function sync() {
  const { data: existing } = await octokit.rest.issues.listLabelsForRepo({
    owner, repo, per_page: 100,
  });
  const existingNames = new Set(existing.map((l) => l.name));

  for (const label of ALL_LABELS) {
    try {
      if (existingNames.has(label.name)) {
        await octokit.rest.issues.updateLabel({ owner, repo, name: label.name, color: label.color, description: label.description });
        console.log(`  updated: ${label.name}`);
      } else {
        await octokit.rest.issues.createLabel({ owner, repo, ...label });
        console.log(`  created: ${label.name}`);
      }
    } catch (e) {
      console.error(`  FAILED: ${label.name}`, e.message);
    }
  }
  console.log(`\nDone! ${ALL_LABELS.length} labels synced to ${owner}/${repo}`);
}

sync();
