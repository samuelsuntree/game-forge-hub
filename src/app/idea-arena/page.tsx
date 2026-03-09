import type { Idea } from "@/types/idea";

// In MVP, ideas map to GitHub Discussions with idea: labels
// For now, show a static UI until GitHub Discussions GraphQL integration is ready

export default async function IdeaArenaPage() {
  // TODO: Fetch from GitHub Discussions API (GraphQL)
  const ideas: Idea[] = [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Idea Arena</h1>
        <p className="text-gray-400 text-sm mt-1">
          Propose ideas, discuss as a team, every decision becomes a traceable ADR
        </p>
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

      {ideas.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-800 rounded-xl">
          <p className="text-gray-500 text-lg mb-2">No ideas yet</p>
          <p className="text-gray-600 text-sm mb-4">
            Create a Discussion in your GitHub repo with an &quot;idea:proposed&quot; label to get
            started
          </p>
          <div className="text-xs text-gray-700 max-w-md mx-auto">
            <p className="mb-2 font-medium text-gray-500">ADR Template:</p>
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
      ) : (
        <div className="grid gap-4">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="p-4 rounded-lg border border-gray-800 bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-white">{idea.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    by @{idea.author}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    idea.status === "accepted"
                      ? "bg-green-500/20 text-green-400"
                      : idea.status === "discussing"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {idea.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
