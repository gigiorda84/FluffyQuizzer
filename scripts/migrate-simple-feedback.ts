import "dotenv/config";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();

  try {
    console.log("🚀 Starting migration to simplified feedback schema...");

    // Drop old feedback table
    console.log("📦 Dropping old feedback table...");
    await client.query(`DROP TABLE IF EXISTS feedback CASCADE`);

    // Create new simplified feedback table
    console.log("✨ Creating new simplified feedback table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        card_id VARCHAR NOT NULL,
        device_id VARCHAR NOT NULL,
        session_id VARCHAR,
        liked BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for better query performance
    console.log("🔍 Creating indexes...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_feedback_card_id ON feedback(card_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_feedback_device_id ON feedback(device_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_feedback_session_id ON feedback(session_id);
    `);

    console.log("✅ Migration completed successfully!");
    console.log("📊 New feedback schema:");
    console.log("   - id: UUID");
    console.log("   - card_id: VARCHAR");
    console.log("   - device_id: VARCHAR");
    console.log("   - session_id: VARCHAR (optional)");
    console.log("   - liked: BOOLEAN (true = 👍, false = 👎)");
    console.log("   - created_at: TIMESTAMP");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
