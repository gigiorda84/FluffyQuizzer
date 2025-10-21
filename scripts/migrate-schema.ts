import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function migrate() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log('🔄 Starting database migration...');

  try {
    // Drop old feedback table
    console.log('  Dropping old feedback table...');
    await sql`DROP TABLE IF EXISTS feedback CASCADE`;

    // Create new game_sessions table
    console.log('  Creating game_sessions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        device_id VARCHAR NOT NULL,
        started_at TIMESTAMP DEFAULT NOW(),
        ended_at TIMESTAMP,
        cards_played INTEGER NOT NULL DEFAULT 0
      )
    `;

    // Create new quiz_answers table
    console.log('  Creating quiz_answers table...');
    await sql`
      CREATE TABLE IF NOT EXISTS quiz_answers (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR NOT NULL,
        card_id VARCHAR NOT NULL,
        device_id VARCHAR NOT NULL,
        selected_option TEXT,
        correct BOOLEAN NOT NULL,
        time_ms INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create new feedback table with 6 feedback options as boolean fields
    console.log('  Creating new feedback table...');
    await sql`
      CREATE TABLE IF NOT EXISTS feedback (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        card_id VARCHAR NOT NULL,
        device_id VARCHAR NOT NULL,
        session_id VARCHAR,
        review BOOLEAN NOT NULL DEFAULT false,
        top BOOLEAN NOT NULL DEFAULT false,
        easy BOOLEAN NOT NULL DEFAULT false,
        hard BOOLEAN NOT NULL DEFAULT false,
        fun BOOLEAN NOT NULL DEFAULT false,
        boring BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create indexes for better query performance
    console.log('  Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_quiz_answers_card_id ON quiz_answers(card_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quiz_answers_session_id ON quiz_answers(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quiz_answers_device_id ON quiz_answers(device_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quiz_answers_correct ON quiz_answers(correct)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_feedback_card_id ON feedback(card_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_feedback_device_id ON feedback(device_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_feedback_session_id ON feedback(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_game_sessions_device_id ON game_sessions(device_id)`;

    console.log('\n✅ Migration completed successfully!');
    console.log('📊 New tables created:');
    console.log('   - game_sessions');
    console.log('   - quiz_answers');
    console.log('   - feedback (restructured with 6 boolean feedback options)');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
