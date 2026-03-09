"use client";

import { useState } from "react";

interface CreateIdeaDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateIdeaDialog({ open, onClose, onCreated }: CreateIdeaDialogProps) {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [proposal, setProposal] = useState("");
  const [consequences, setConsequences] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/idea/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, context, proposal, consequences }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to create idea");
        return;
      }

      setTitle("");
      setContext("");
      setProposal("");
      setConsequences("");
      onCreated();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Propose New Idea</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-xs text-gray-500">
            This creates an ADR (Architecture Decision Record) in GitHub Discussions.
          </p>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Idea Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Use ECS architecture for combat system"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Context *</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              required
              rows={3}
              placeholder="Why is this idea needed? What problem does it solve?"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Proposal *</label>
            <textarea
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              required
              rows={3}
              placeholder="What do you propose? How should we implement it?"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Trade-offs & Consequences (optional)
            </label>
            <textarea
              value={consequences}
              onChange={(e) => setConsequences(e.target.value)}
              rows={2}
              placeholder="What are the risks or downsides?"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

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
              disabled={submitting || !title || !context || !proposal}
              className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
            >
              {submitting ? "Submitting..." : "Submit Proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
