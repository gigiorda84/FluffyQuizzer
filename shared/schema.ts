import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Fluffy Trivia cards table
export const cards = pgTable("cards", {
  id: varchar("id").primaryKey(),
  categoria: text("categoria").notNull(),
  colore: text("colore").notNull(),
  domanda: text("domanda").notNull(),
  opzioneA: text("opzione_a"),
  opzioneB: text("opzione_b"),
  opzioneC: text("opzione_c"),
  corretta: text("corretta"), // 'A', 'B', 'C' or null
  battuta: text("battuta"),
  tipo: text("tipo").notNull(), // 'quiz' or 'speciale'
  hidden: boolean("hidden").notNull().default(false), // hide card from game
  numeroCarte: integer("numero_carte").notNull().default(1), // weight for random selection
  createdAt: timestamp("created_at").defaultNow(),
});

// Game sessions table - tracks each game session
export const gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  cardsPlayed: integer("cards_played").notNull().default(0),
});

// Quiz answers table - tracks every quiz answer
export const quizAnswers = pgTable("quiz_answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  cardId: varchar("card_id").notNull(),
  deviceId: varchar("device_id").notNull(),
  selectedOption: text("selected_option"), // 'A', 'B', 'C'
  correct: boolean("correct").notNull(),
  timeMs: integer("time_ms"), // response time in milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

// User feedback table - tracks the 6 feedback options
export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cardId: varchar("card_id").notNull(),
  deviceId: varchar("device_id").notNull(),
  sessionId: varchar("session_id"), // optional link to session
  // The 6 feedback types
  review: boolean("review").notNull().default(false), // wants to review later
  top: boolean("top").notNull().default(false), // top quality card
  easy: boolean("easy").notNull().default(false), // too easy
  hard: boolean("hard").notNull().default(false), // too difficult
  fun: boolean("fun").notNull().default(false), // fun/entertaining
  boring: boolean("boring").notNull().default(false), // boring/unengaging
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const cardsRelations = relations(cards, ({ many }) => ({
  feedback: many(feedback),
  quizAnswers: many(quizAnswers),
}));

export const gameSessionsRelations = relations(gameSessions, ({ many }) => ({
  quizAnswers: many(quizAnswers),
  feedback: many(feedback),
}));

export const quizAnswersRelations = relations(quizAnswers, ({ one }) => ({
  card: one(cards, {
    fields: [quizAnswers.cardId],
    references: [cards.id],
  }),
  session: one(gameSessions, {
    fields: [quizAnswers.sessionId],
    references: [gameSessions.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  card: one(cards, {
    fields: [feedback.cardId],
    references: [cards.id],
  }),
  session: one(gameSessions, {
    fields: [feedback.sessionId],
    references: [gameSessions.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCardSchema = createInsertSchema(cards).omit({
  createdAt: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  startedAt: true,
});

export const insertQuizAnswerSchema = createInsertSchema(quizAnswers).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Card = typeof cards.$inferSelect;
export type InsertCard = z.infer<typeof insertCardSchema>;
export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type QuizAnswer = typeof quizAnswers.$inferSelect;
export type InsertQuizAnswer = z.infer<typeof insertQuizAnswerSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
