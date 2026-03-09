# GameForgeHub

Lightweight game dev collaboration platform — making game development feel like playing a game.

Built for small, high-powered teams who want to ditch heavyweight project management tools and keep everything in GitHub.

## What It Does

| Module | For Who | What They Do |
|--------|---------|-------------|
| **Quest Board** | Everyone | Claim tasks like game quests, earn points, track WIP |
| **Idea Arena** | Everyone | Propose ideas as ADR records, discuss, vote |
| **Live Roadmap** | Everyone | View milestone progress, branch health, daily reports |
| **Leaderboard** | Everyone | See team scoring and achievements |

**Non-technical team members** (project managers, artists, designers) can do everything from the web UI — no GitHub knowledge required:

- Create/assign/update tasks via form dialogs
- Create milestones with due dates
- Propose ideas and write comments
- View real-time progress and team stats

All operations are automatically synced to GitHub Issues/Discussions/Milestones as the permanent record.

## Quick Start

### 1. Prerequisites

- Node.js 18+
- A GitHub repo for your game project
- A GitHub Personal Access Token (PAT)

### 2. Clone and Install

```bash
git clone https://github.com/samuelsuntree/game-forge-hub.git
cd game-forge-hub
npm install
```

### 3. Create a GitHub Personal Access Token

Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens) and create a token with these scopes:

- `repo` (full control of private repositories)
- `write:discussion` (if you want Idea Arena to work)

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_OWNER=your-org-or-username
GITHUB_REPO=your-game-repo
GITHUB_WEBHOOK_SECRET=any-random-string-you-choose
```

### 5. Initialize Database

```bash
npx drizzle-kit push
```

### 6. Sync Labels to Your Game Repo

The first time you run, sync the label system to your GitHub repo:

```bash
npx tsx -e "
const { syncLabels } = require('./src/lib/github/labels');
syncLabels().then(n => console.log(n + ' labels synced'));
"
```

This creates labels like `quest:available`, `difficulty:hard`, `type:bug`, etc.

### 7. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Setting Up Webhooks (for real-time updates)

To get live updates when someone pushes code, merges a PR, or closes an issue directly on GitHub:

### Option A: Local Development (with ngrok)

```bash
# Install ngrok
brew install ngrok

# Expose your local server
ngrok http 3000
```

Copy the ngrok URL (e.g. `https://abc123.ngrok.io`).

### Option B: Deployed Server

Use your deployed URL directly.

### Configure in GitHub

1. Go to your game repo > **Settings > Webhooks > Add webhook**
2. **Payload URL:** `https://your-url/api/github/webhook`
3. **Content type:** `application/json`
4. **Secret:** same value as `GITHUB_WEBHOOK_SECRET` in your `.env`
5. **Events:** Select:
   - Issues
   - Pull requests
   - Pull request reviews
   - Pushes
   - Discussions
   - Milestones

## How It Works

```
Your team works on GitHub (or the web UI)
        |
        v
GitHub Webhook fires  ──>  GameForgeHub receives event
                                    |
                           +--------+--------+
                           |        |        |
                        Update   Calculate   Broadcast
                        SQLite   Points &    via SSE
                        cache    Achievements
                           |        |        |
                           +--------+--------+
                                    |
                                    v
                           Web UI updates in real-time
```

**Key principle: GitHub is the single source of truth.** GameForgeHub only adds a gaming layer (points, achievements, WIP limits) on top. Delete the local database and everything still works — you just lose score history.

## Scoring System

| Action | Points |
|--------|--------|
| Claim a quest | +2 |
| Complete easy quest | +5 |
| Complete normal quest | +10 |
| Complete hard quest | +20 |
| Complete epic quest | +40 |
| Merge a PR | +15 |
| Review someone's PR | +5 |
| Propose an idea | +3 |
| Idea gets accepted | +10 |
| Report a bug | +3 |
| Speed bonus (finish early) | +5 to +15 |
| Transfer a quest away | -1 |

## Achievements

| Achievement | Condition |
|------------|-----------|
| First Blood | Complete your first quest |
| Bug Hunter | Fix 10 bugs |
| Idea Machine | Get 5 ideas accepted |
| Review Master | Complete 20 code reviews |
| Speed Demon | Finish a quest in under 50% estimated time |
| Team Player | Collaborate on 5 quests |
| On Fire | 7-day activity streak |
| Centurion | Reach 100 total points |

## Project Structure

```
src/
  app/              # Pages and API routes
    api/
      github/webhook/   # Receives GitHub events
      quest/            # Create, claim, transfer, complete, comment
      idea/             # Create ideas (GitHub Discussions)
      milestone/        # Create/list milestones
      score/            # Leaderboard
      team/             # List collaborators
      events/stream/    # SSE real-time endpoint
    quest-board/        # Kanban board page
    idea-arena/         # Ideas & ADR page
    live-roadmap/       # Milestones & branch health
    leaderboard/        # Scoring page
  lib/
    github/         # Octokit wrappers (issues, PRs, milestones, branches)
    db/             # Drizzle ORM schema (SQLite)
    webhook/        # Event handlers (issues, PRs, discussions, push)
    scoring/        # Points engine & achievement rules
    realtime/       # SSE event bus
  components/       # React components per module
  types/            # TypeScript type definitions
```

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 (App Router) | Server Components for GitHub data, API routes |
| GitHub API | Octokit | Official SDK |
| Database | SQLite + Drizzle ORM | Lightweight, no external services |
| Real-time | Server-Sent Events | Simpler than WebSocket, auto-reconnect |
| Styling | Tailwind CSS | Fast, consistent |

## Design Philosophy

Based on [PMBOK 7th Edition](docs/pmbok7-principles.md) principles:

- **Tailoring** — Use "just enough" process. GitHub is the database, we don't duplicate.
- **Self-organizing teams** — Pull model: claim tasks, don't get assigned.
- **Value over output** — Score impact (difficulty, speed, collaboration), not hours worked.
- **Short feedback loops** — SSE real-time updates, daily auto-reports.
- **Measure what matters** — Only 5-7 core metrics, no vanity indicators.

## Deployment

### Vercel

```bash
npm run build
vercel deploy
```

Note: SSE works on Vercel Edge Runtime. Set environment variables in Vercel dashboard.

### Self-hosted (Docker)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## License

MIT
