"use client";

import { useState } from "react";
import type { MilestoneOverview } from "@/types/roadmap";
import { CreateMilestoneDialog } from "@/components/live-roadmap/CreateMilestoneDialog";

interface LiveRoadmapClientProps {
  initialMilestones: MilestoneOverview[];
}

export function LiveRoadmapClient({ initialMilestones }: LiveRoadmapClientProps) {
  const [showCreate, setShowCreate] = useState(false);
  const milestones = initialMilestones;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Roadmap</h1>
          <p className="text-gray-400 text-sm mt-1">
            Milestone progress, burndown charts, branch health
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          + New Milestone
        </button>
      </div>

      {/* Milestones */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-300 mb-4">Milestones</h2>
        {milestones.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl">
            <p className="text-gray-500">No milestones found</p>
            <p className="text-gray-600 text-sm mt-1">
              Click &quot;+ New Milestone&quot; to create your first milestone
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-lg border border-gray-800 bg-gray-900"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-white">{m.title}</h3>
                    {m.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                    )}
                    {m.dueOn && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Due: {new Date(m.dueOn).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      m.state === "closed"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {m.state === "closed" ? "Completed" : `${m.progress}%`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      m.progress === 100 ? "bg-green-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${m.progress}%` }}
                  />
                </div>

                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>{m.closedIssues} done</span>
                  <span>{m.openIssues} open</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Branch Health placeholder */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-300 mb-4">Branch Health</h2>
        <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl">
          <p className="text-gray-500">Branch health monitoring</p>
          <p className="text-gray-600 text-sm mt-1">
            Shows ahead/behind status relative to main branch
          </p>
        </div>
      </section>

      {/* Daily Report placeholder */}
      <section>
        <h2 className="text-lg font-semibold text-gray-300 mb-4">Daily Report</h2>
        <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl">
          <p className="text-gray-500">Today&apos;s team report will appear here</p>
          <p className="text-gray-600 text-sm mt-1">
            Auto-generated daily at UTC 00:00
          </p>
        </div>
      </section>

      <CreateMilestoneDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => window.location.reload()}
      />
    </div>
  );
}
