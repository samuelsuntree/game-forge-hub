"use client";

import { useState } from "react";
import { CreateIdeaDialog } from "@/components/idea-arena/CreateIdeaDialog";

export function IdeaArenaClient() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Idea Arena</h1>
          <p className="text-gray-400 text-sm mt-1">
            Propose ideas, discuss as a team, every decision becomes a traceable ADR
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
        >
          + New Idea
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6">
        {["All", "Proposed", "Discussing", "Accepted", "Rejected", "Implemented"].map(
          (tab) => (
            <button
              key={tab}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                tab === "All"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {tab}
            </button>
          )
        )}
      </div>

      <div className="text-center py-20 border border-dashed border-gray-800 rounded-xl">
        <p className="text-gray-500 text-lg mb-2">No ideas yet</p>
        <p className="text-gray-600 text-sm mb-4">
          Click &quot;+ New Idea&quot; to propose your first idea
        </p>
        <div className="text-xs text-gray-700 max-w-md mx-auto">
          <p className="mb-2 font-medium text-gray-500">Your idea will be formatted as an ADR:</p>
          <pre className="text-left bg-gray-900 p-4 rounded-lg">
            {`## Status
proposed

## Context
Why is this idea needed?

## Decision
What do we propose?

## Consequences
What are the trade-offs?`}
          </pre>
        </div>
      </div>

      <CreateIdeaDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => window.location.reload()}
      />
    </div>
  );
}
