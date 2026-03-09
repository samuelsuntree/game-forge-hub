export interface MilestoneOverview {
  id: number;
  number: number;
  title: string;
  description: string | null;
  dueOn: string | null;
  openIssues: number;
  closedIssues: number;
  progress: number; // 0-100
  state: "open" | "closed";
}

export interface BurndownPoint {
  date: string;
  openIssues: number;
  closedIssues: number;
  totalIssues: number;
}

export interface BranchHealth {
  name: string;
  aheadBy: number;
  behindBy: number;
  status: "ahead" | "behind" | "diverged" | "identical";
  lastPushAt: string | null;
  staleDays: number;
  hasOpenPR: boolean;
}

export interface DailyReport {
  date: string;
  issuesClosed: number;
  issuesOpened: number;
  prsMerged: number;
  prsOpened: number;
  activeContributors: string[];
  topContributor: string | null;
  blockedIssues: number;
  milestoneProgress: MilestoneOverview[];
}
