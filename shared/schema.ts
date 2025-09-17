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
  createdAt: timestamp("created_at").defaultNow(),
});

// User feedback table
export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cardId: varchar("card_id").notNull(),
  deviceId: varchar("device_id").notNull(), // localStorage-based device identification
  reaction: text("reaction").notNull(), // 'answered', 'review', 'easy', 'fun', 'top', 'hard', 'boring'
  correct: boolean("correct"), // only for 'answered' reactions
  timeMs: integer("time_ms"), // response time for 'answered' reactions
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const cardsRelations = relations(cards, ({ many }) => ({
  feedback: many(feedback),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  card: one(cards, {
    fields: [feedback.cardId],
    references: [cards.id],
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

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Card = typeof cards.$inferSelect;
export type InsertCard = z.infer<typeof insertCardSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
