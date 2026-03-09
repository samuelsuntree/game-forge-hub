export type IdeaStatus = "proposed" | "discussing" | "accepted" | "rejected" | "implemented";

export interface Idea {
  id: string;
  title: string;
  body: string;
  status: IdeaStatus;
  author: string;
  authorAvatarUrl: string;
  votes: number;
  boundIssues: number[];
  boundPRs: number[];
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface AdrRecord {
  ideaId: string;
  status: IdeaStatus;
  context: string;
  decision: string;
  consequences: string;
  participants: string[];
}
