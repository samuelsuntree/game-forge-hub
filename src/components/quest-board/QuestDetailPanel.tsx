"use client";

import { useState, useEffect, useCallback } from "react";
import type { Quest } from "@/types/quest";
import { ScoreBadge } from "../shared/ScoreBadge";

interface Comment {
  id: number;
  body: string;
  author: string;
  authorAvatar: string;
  createdAt: string;
}

interface TeamMember {
  login: string;
  avatarUrl: string;
}

interface QuestDetailPanelProps {
  quest: Quest;
  onClose: () => void;
  onUpdated: () => void;
}

export function QuestDetailPanel({ quest, onClose, onUpdated }: QuestDetailPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [editingStatus, setEditingStatus] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/quest/comment?issueNumber=${quest.issueNumber}`);
      if (res.ok) setComments(await res.json());
    } catch { /* ignore */ }
  }, [quest.issueNumber]);

  useEffect(() => {
    loadComments();
    fetch("/api/team").then((r) => r.json()).then(setTeam).catch(() => {});
  }, [loadComments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/quest/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueNumber: quest.issueNumber, body: newComment }),
      });
      setNewComment("");
      await loadComments();
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    await fetch("/api/quest/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueNumber: quest.issueNumber, status: newStatus }),
    });
    setEditingStatus(false);
    onUpdated();
  };

  const handleAssign = async (username: string) => {
    if (username) {
      await fetch("/api/quest/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueNumber: quest.issueNumber, username }),
      });
    } else {
      await fetch("/api/quest/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueNumber: quest.issueNumber, assignee: null }),
      });
    }
    onUpdated();
  };

  const handleDifficultyChange = async (difficulty: string) => {
    await fetch("/api/quest/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueNumber: quest.issueNumber, difficulty }),
    });
    onUpdated();
  };

  const statusOptions = [
    { value: "available", label: "Available" },
    { value: "claimed", label: "Claimed" },
    { value: "in-progress", label: "In Progress" },
    { value: "review", label: "Review" },
    { value: "done", label: "Done" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
      <div className="bg-gray-900 border-l border-gray-700 w-full max-w-xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">
              #{quest.issueNumber}
            </h2>
            <ScoreBadge score={quest.basePoints + quest.bonusPoints} size="sm" />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
            &times;
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Title */}
          <h3 className="text-xl font-medium text-white">{quest.title}</h3>

          {/* Controls - this is the key part for non-technical managers */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
                Status
              </label>
              {editingStatus ? (
                <div className="flex flex-col gap-1">
                  {statusOptions.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => handleStatusChange(s.value)}
                      className={`text-left text-sm px-2 py-1 rounded hover:bg-gray-700 ${
                        quest.status === s.value ? "bg-gray-700 text-white" : "text-gray-400"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => setEditingStatus(true)}
                  className="text-sm px-3 py-1.5 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  {quest.status}
                </button>
              )}
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
                Difficulty
              </label>
              <select
                value={quest.difficulty}
                onChange={(e) => handleDifficultyChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="easy">Easy (5 pts)</option>
                <option value="normal">Normal (10 pts)</option>
                <option value="hard">Hard (20 pts)</option>
                <option value="epic">Epic (40 pts)</option>
              </select>
            </div>

            {/* Assignee */}
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
                Assigned To
              </label>
              <select
                value={quest.claimedBy || ""}
                onChange={(e) => handleAssign(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Unassigned</option>
                {team.map((m) => (
                  <option key={m.login} value={m.login}>
                    @{m.login}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          {quest.body && (
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
                Description
              </label>
              <div className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-800 rounded p-3">
                {quest.body}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
              Discussion ({comments.length})
            </label>

            <div className="space-y-3 mb-3">
              {comments.map((c) => (
                <div key={c.id} className="bg-gray-800 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    {c.authorAvatar && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.authorAvatar} alt="" className="w-5 h-5 rounded-full" />
                    )}
                    <span className="text-xs font-medium text-gray-300">@{c.author}</span>
                    <span className="text-xs text-gray-600">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 whitespace-pre-wrap">{c.body}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleAddComment}
                disabled={submitting || !newComment.trim()}
                className="self-end px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
              >
                {submitting ? "..." : "Send"}
              </button>
            </div>
          </div>

          {/* GitHub link */}
          <div className="pt-2 border-t border-gray-800">
            <a
              href={quest.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-blue-400 transition-colors"
            >
              View on GitHub &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
