"use client";

import { useState, useEffect } from "react";

interface Milestone {
  number: number;
  title: string;
}

interface TeamMember {
  login: string;
  avatarUrl: string;
}

interface CreateQuestDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateQuestDialog({ open, onClose, onCreated }: CreateQuestDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("normal");
  const [type, setType] = useState("feature");
  const [milestone, setMilestone] = useState<number | undefined>();
  const [assignee, setAssignee] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (open) {
      fetch("/api/milestone").then((r) => r.json()).then(setMilestones).catch(() => {});
      fetch("/api/team").then((r) => r.json()).then(setTeam).catch(() => {});
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/quest/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          difficulty,
          type,
          milestone,
          acceptanceCriteria,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to create quest");
        return;
      }

      const result = await res.json();

      // If assignee selected, assign right after creation
      if (assignee) {
        await fetch("/api/quest/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            issueNumber: result.issueNumber,
            username: assignee,
          }),
        });
      }

      // Reset form
      setTitle("");
      setDescription("");
      setDifficulty("normal");
      setType("feature");
      setMilestone(undefined);
      setAssignee("");
      setAcceptanceCriteria("");
      onCreated();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const pointsMap: Record<string, number> = { easy: 5, normal: 10, hard: 20, epic: 40 };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Create New Quest</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Quest Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Implement player inventory system"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Describe what needs to be done..."
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Difficulty + Type row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Difficulty ({pointsMap[difficulty]} pts)
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="easy">Easy (5 pts)</option>
                <option value="normal">Normal (10 pts)</option>
                <option value="hard">Hard (20 pts)</option>
                <option value="epic">Epic (40 pts)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="feature">Feature</option>
                <option value="bug">Bug Fix</option>
                <option value="chore">Chore</option>
                <option value="docs">Documentation</option>
              </select>
            </div>
          </div>

          {/* Milestone + Assignee row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Milestone</label>
              <select
                value={milestone || ""}
                onChange={(e) => setMilestone(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">None</option>
                {milestones.map((m) => (
                  <option key={m.number} value={m.number}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Assign To</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Unassigned (open quest)</option>
                {team.map((m) => (
                  <option key={m.login} value={m.login}>
                    @{m.login}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Acceptance Criteria */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Acceptance Criteria (optional)
            </label>
            <textarea
              value={acceptanceCriteria}
              onChange={(e) => setAcceptanceCriteria(e.target.value)}
              rows={3}
              placeholder={"- [ ] Players can view inventory\n- [ ] Items can be equipped\n- [ ] Drag and drop works"}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title || !description}
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
            >
              {submitting ? "Creating..." : "Publish Quest"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
