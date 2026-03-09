import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">
          Game<span className="text-blue-400">Forge</span>Hub
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Making game development feel like playing a game.
          Lightweight collaboration for small, high-powered teams.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/quest-board"
          className="group block p-6 rounded-xl border border-gray-800 hover:border-green-600 bg-gray-900 hover:bg-gray-900/80 transition-all"
        >
          <div className="text-2xl mb-3">Quest Board</div>
          <p className="text-sm text-gray-400 group-hover:text-gray-300">
            Claim tasks like accepting quests. Track WIP limits, earn points, unlock achievements.
          </p>
          <div className="mt-4 text-xs text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
            View board &rarr;
          </div>
        </Link>

        <Link
          href="/idea-arena"
          className="group block p-6 rounded-xl border border-gray-800 hover:border-purple-600 bg-gray-900 hover:bg-gray-900/80 transition-all"
        >
          <div className="text-2xl mb-3">Idea Arena</div>
          <p className="text-sm text-gray-400 group-hover:text-gray-300">
            Propose ideas, discuss, vote. Every accepted idea becomes an ADR with traceable decisions.
          </p>
          <div className="mt-4 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Explore ideas &rarr;
          </div>
        </Link>

        <Link
          href="/live-roadmap"
          className="group block p-6 rounded-xl border border-gray-800 hover:border-blue-600 bg-gray-900 hover:bg-gray-900/80 transition-all"
        >
          <div className="text-2xl mb-3">Live Roadmap</div>
          <p className="text-sm text-gray-400 group-hover:text-gray-300">
            Real-time milestone burndown, branch health, daily team reports.
          </p>
          <div className="mt-4 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
            View roadmap &rarr;
          </div>
        </Link>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/leaderboard"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          View Leaderboard &rarr;
        </Link>
      </div>
    </div>
  );
}
