import * as schema from "./schema";

type DbInstance = ReturnType<typeof import("drizzle-orm/better-sqlite3").drizzle>;

let _db: DbInstance | null = null;
let _unavailable = false;

/**
 * Get database instance. Returns null on platforms where
 * better-sqlite3 is not available (e.g. Cloudflare Workers).
 * Scoring features gracefully degrade without a database.
 */
export function getDb(): DbInstance | null {
  if (_unavailable) return null;
  if (_db) return _db;

  try {
    // Dynamic imports to avoid breaking on Cloudflare Workers
    const { drizzle } = require("drizzle-orm/better-sqlite3");
    const Database = require("better-sqlite3");
    const path = require("path");
    const fs = require("fs");

    const dbPath = process.env.DATABASE_PATH || "./data/game-forge.db";
    const dir = path.dirname(dbPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");

    _db = drizzle(sqlite, { schema });
    return _db;
  } catch {
    console.warn("SQLite not available on this platform. Scoring features disabled.");
    _unavailable = true;
    return null;
  }
}
