-- Migration script to update feedback schema and add new tables
-- WARNING: This will delete all existing feedback data

-- Drop old feedback table
DROP TABLE IF EXISTS feedback CASCADE;

-- Create new game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  cards_played INTEGER NOT NULL DEFAULT 0
);

-- Create new quiz_answers table
CREATE TABLE IF NOT EXISTS quiz_answers (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR NOT NULL,
  card_id VARCHAR NOT NULL,
  device_id VARCHAR NOT NULL,
  selected_option TEXT,
  correct BOOLEAN NOT NULL,
  time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
);

-- Create new feedback table with 6 feedback options as boolean fields
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
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quiz_answers_card_id ON quiz_answers(card_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_session_id ON quiz_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_device_id ON quiz_answers(device_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_correct ON quiz_answers(correct);
CREATE INDEX IF NOT EXISTS idx_feedback_card_id ON feedback(card_id);
CREATE INDEX IF NOT EXISTS idx_feedback_device_id ON feedback(device_id);
CREATE INDEX IF NOT EXISTS idx_feedback_session_id ON feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_device_id ON game_sessions(device_id);
