import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function addSessionStats() {
  console.log("Adding feedbackCount and durationMs columns to game_sessions table...");

  try {
    // Add feedbackCount column
    await db.execute(sql`
      ALTER TABLE game_sessions
      ADD COLUMN IF NOT EXISTS feedback_count INTEGER NOT NULL DEFAULT 0
    `);

    // Add durationMs column
    await db.execute(sql`
      ALTER TABLE game_sessions
      ADD COLUMN IF NOT EXISTS duration_ms INTEGER
    `);

    console.log("✓ Successfully added feedbackCount and durationMs columns");
  } catch (error) {
    console.error("Error adding columns:", error);
    process.exit(1);
  }

  process.exit(0);
}

addSessionStats();
