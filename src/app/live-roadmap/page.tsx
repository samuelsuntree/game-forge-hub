import { LiveRoadmapClient } from "./LiveRoadmapClient";
import type { MilestoneOverview } from "@/types/roadmap";

export default async function LiveRoadmapPage() {
  let milestones: MilestoneOverview[] = [];

  try {
    const { listMilestones } = await import("@/lib/github/milestones");
    const rawMilestones = await listMilestones("all");

    milestones = rawMilestones.map((m) => ({
      id: m.id,
      number: m.number,
      title: m.title,
      description: m.description,
      dueOn: m.due_on,
      openIssues: m.open_issues,
      closedIssues: m.closed_issues,
      progress:
        m.open_issues + m.closed_issues > 0
          ? Math.round((m.closed_issues / (m.open_issues + m.closed_issues)) * 100)
          : 0,
      state: m.state as "open" | "closed",
    }));
  } catch (error) {
    console.error("Failed to load milestones:", error);
  }

  return <LiveRoadmapClient initialMilestones={milestones} />;
}
