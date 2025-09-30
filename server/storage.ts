import {
  type User,
  type InsertUser,
  type Card,
  type InsertCard,
  type Feedback,
  type InsertFeedback,
  users,
  cards,
  feedback
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, inArray, and } from "drizzle-orm";

// Storage interface for Fluffy Trivia
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Card methods
  getAllCards(): Promise<Card[]>;
  getCardsByCategory(categoria: string): Promise<Card[]>;
  getRandomCard(categoria?: string): Promise<Card | undefined>;
  getCard(id: string): Promise<Card | undefined>;
  createCard(card: InsertCard): Promise<Card>;
  updateCard(id: string, card: Partial<InsertCard>): Promise<Card | undefined>;
  deleteCard(id: string): Promise<boolean>;
  deleteMultipleCards(ids: string[]): Promise<number>;
  hideMultipleCards(ids: string[]): Promise<number>;
  showMultipleCards(ids: string[]): Promise<number>;
  
  // Feedback methods
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackByCard(cardId: string): Promise<Feedback[]>;
  getFeedbackByDevice(deviceId: string): Promise<Feedback[]>;
  getAllFeedback(): Promise<Feedback[]>;
  deleteAllFeedback(): Promise<number>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Card methods
  async getAllCards(): Promise<Card[]> {
    return await db.select().from(cards);
  }

  async getCardsByCategory(categoria: string): Promise<Card[]> {
    return await db.select().from(cards).where(eq(cards.categoria, categoria));
  }

  async getRandomCard(categoria?: string): Promise<Card | undefined> {
    let query = db.select().from(cards);

    // Always filter out hidden cards from the game
    if (categoria) {
      query = query.where(and(eq(cards.categoria, categoria), eq(cards.hidden, false)));
    } else {
      query = query.where(eq(cards.hidden, false));
    }

    // Get all eligible cards
    const eligibleCards = await query;

    if (eligibleCards.length === 0) {
      return undefined;
    }

    // Create a weighted pool based on numeroCarte
    const weightedPool: Card[] = [];
    for (const card of eligibleCards) {
      // Add the card numeroCarte times to simulate multiple instances
      for (let i = 0; i < (card.numeroCarte || 1); i++) {
        weightedPool.push(card);
      }
    }

    // Select random card from weighted pool
    const randomIndex = Math.floor(Math.random() * weightedPool.length);
    return weightedPool[randomIndex];
  }

  async getCard(id: string): Promise<Card | undefined> {
    const [card] = await db.select().from(cards).where(eq(cards.id, id));
    return card || undefined;
  }

  async createCard(card: InsertCard): Promise<Card> {
    const [newCard] = await db
      .insert(cards)
      .values(card)
      .returning();
    return newCard;
  }

  async updateCard(id: string, card: Partial<InsertCard>): Promise<Card | undefined> {
    const [updatedCard] = await db
      .update(cards)
      .set(card)
      .where(eq(cards.id, id))
      .returning();
    return updatedCard || undefined;
  }

  async deleteCard(id: string): Promise<boolean> {
    const result = await db.delete(cards).where(eq(cards.id, id));
    return (result.rowCount || 0) > 0;
  }

  async deleteMultipleCards(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;

    const result = await db.delete(cards).where(inArray(cards.id, ids));
    return result.rowCount || 0;
  }

  async hideMultipleCards(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;

    const result = await db
      .update(cards)
      .set({ hidden: true })
      .where(inArray(cards.id, ids));
    return result.rowCount || 0;
  }

  async showMultipleCards(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;

    const result = await db
      .update(cards)
      .set({ hidden: false })
      .where(inArray(cards.id, ids));
    return result.rowCount || 0;
  }

  // Feedback methods
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db
      .insert(feedback)
      .values(feedbackData)
      .returning();
    return newFeedback;
  }

  async getFeedbackByCard(cardId: string): Promise<Feedback[]> {
    return await db.select().from(feedback).where(eq(feedback.cardId, cardId));
  }

  async getFeedbackByDevice(deviceId: string): Promise<Feedback[]> {
    return await db.select().from(feedback).where(eq(feedback.deviceId, deviceId));
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return await db.select().from(feedback);
  }

  async deleteAllFeedback(): Promise<number> {
    const result = await db.delete(feedback);
    return result.rowCount || 0;
  }
}

export const storage = new DatabaseStorage();
