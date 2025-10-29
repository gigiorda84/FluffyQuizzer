import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCardSchema, insertFeedbackSchema, insertGameSessionSchema, insertQuizAnswerSchema } from "@shared/schema";
import { z } from "zod";
import fs from "fs";
import path from "path";
import multer from "multer";
import { parse } from "csv-parse/sync";

// Configure multer for CSV file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Solo file CSV sono permessi'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all cards
  app.get("/api/cards", async (req, res) => {
    try {
      const cards = await storage.getAllCards();
      console.log('GET /api/cards - First card sample:', cards[0]);
      console.log('First card numeroCarte:', cards[0]?.numeroCarte, 'type:', typeof cards[0]?.numeroCarte);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      res.status(500).json({ error: "Failed to fetch cards" });
    }
  });

  // Get cards by category
  app.get("/api/cards/category/:categoria", async (req, res) => {
    try {
      const { categoria } = req.params;
      const cards = await storage.getCardsByCategory(categoria);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching cards by category:", error);
      res.status(500).json({ error: "Failed to fetch cards by category" });
    }
  });

  // Get a random card (optionally filtered by category)
  app.get("/api/cards/random", async (req, res) => {
    try {
      const { categoria } = req.query;
      const randomCard = await storage.getRandomCard(categoria as string);
      
      if (!randomCard) {
        return res.status(404).json({ error: "No cards available" });
      }
      
      res.json(randomCard);
    } catch (error) {
      console.error("Error fetching random card:", error);
      res.status(500).json({ error: "Failed to fetch random card" });
    }
  });

  // Get a specific card
  app.get("/api/cards/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const card = await storage.getCard(id);
      if (!card) {
        return res.status(404).json({ error: "Card not found" });
      }
      res.json(card);
    } catch (error) {
      console.error("Error fetching card:", error);
      res.status(500).json({ error: "Failed to fetch card" });
    }
  });

  // Create a new card
  app.post("/api/cards", async (req, res) => {
    try {
      const cardData = insertCardSchema.parse(req.body);
      const card = await storage.createCard(cardData);
      res.status(201).json(card);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid card data", details: error.errors });
      }
      console.error("Error creating card:", error);
      res.status(500).json({ error: "Failed to create card" });
    }
  });

  // Update a card
  app.put("/api/cards/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`PUT /api/cards/${id} - Received data:`, req.body);
      console.log('numeroCarte in request:', req.body.numeroCarte, 'type:', typeof req.body.numeroCarte);

      const cardData = insertCardSchema.partial().parse(req.body);
      console.log('Parsed card data:', cardData);
      console.log('numeroCarte after parsing:', cardData.numeroCarte, 'type:', typeof cardData.numeroCarte);

      const updatedCard = await storage.updateCard(id, cardData);
      console.log('Updated card from database:', updatedCard);

      if (!updatedCard) {
        return res.status(404).json({ error: "Card not found" });
      }

      res.json(updatedCard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid card data", details: error.errors });
      }
      console.error("Error updating card:", error);
      res.status(500).json({ error: "Failed to update card" });
    }
  });

  // Batch delete cards (must come before single delete route)
  app.delete("/api/cards/batch", async (req, res) => {
    try {
      const { cardIds } = req.body;

      if (!Array.isArray(cardIds) || cardIds.length === 0) {
        return res.status(400).json({ error: "cardIds must be a non-empty array" });
      }

      const deletedCount = await storage.deleteMultipleCards(cardIds);

      res.json({
        message: `Successfully deleted ${deletedCount} cards`,
        deletedCount
      });
    } catch (error) {
      console.error("Error batch deleting cards:", error);
      res.status(500).json({ error: "Failed to batch delete cards" });
    }
  });

  // Batch hide cards
  app.put("/api/cards/batch/hide", async (req, res) => {
    try {
      const { cardIds } = req.body;

      if (!Array.isArray(cardIds) || cardIds.length === 0) {
        return res.status(400).json({ error: "cardIds must be a non-empty array" });
      }

      const hiddenCount = await storage.hideMultipleCards(cardIds);

      res.json({
        message: `Successfully hidden ${hiddenCount} cards`,
        hiddenCount
      });
    } catch (error) {
      console.error("Error batch hiding cards:", error);
      res.status(500).json({ error: "Failed to batch hide cards" });
    }
  });

  // Batch show cards
  app.put("/api/cards/batch/show", async (req, res) => {
    try {
      const { cardIds } = req.body;

      if (!Array.isArray(cardIds) || cardIds.length === 0) {
        return res.status(400).json({ error: "cardIds must be a non-empty array" });
      }

      const shownCount = await storage.showMultipleCards(cardIds);

      res.json({
        message: `Successfully shown ${shownCount} cards`,
        shownCount
      });
    } catch (error) {
      console.error("Error batch showing cards:", error);
      res.status(500).json({ error: "Failed to batch show cards" });
    }
  });

  // Delete a card
  app.delete("/api/cards/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCard(id);

      if (!deleted) {
        return res.status(404).json({ error: "Card not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting card:", error);
      res.status(500).json({ error: "Failed to delete card" });
    }
  });

  // Create feedback
  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.createFeedback(feedbackData);
      res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid feedback data", details: error.errors });
      }
      console.error("Error creating feedback:", error);
      res.status(500).json({ error: "Failed to create feedback" });
    }
  });

  // Get all feedback
  app.get("/api/feedback", async (req, res) => {
    try {
      const feedback = await storage.getAllFeedback();
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  // Get feedback by card
  app.get("/api/feedback/card/:cardId", async (req, res) => {
    try {
      const { cardId } = req.params;
      const feedback = await storage.getFeedbackByCard(cardId);
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback by card:", error);
      res.status(500).json({ error: "Failed to fetch feedback by card" });
    }
  });

  // Delete all feedback (Admin only)
  app.delete("/api/feedback/delete-all", async (req, res) => {
    try {
      const deletedCount = await storage.deleteAllFeedback();
      res.json({
        message: `Successfully deleted ${deletedCount} feedback entries`,
        deletedCount
      });
    } catch (error) {
      console.error("Error deleting all feedback:", error);
      res.status(500).json({ error: "Failed to delete all feedback" });
    }
  });

  // ============ GAME SESSIONS API ============

  // Create a new game session
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertGameSessionSchema.parse(req.body);
      const session = await storage.createGameSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid session data", details: error.errors });
      }
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Get a session by ID
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.getGameSession(id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  // Update a session (e.g., when ending it)
  app.put("/api/sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const sessionData = insertGameSessionSchema.partial().parse(req.body);
      const updatedSession = await storage.updateGameSession(id, sessionData);

      if (!updatedSession) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json(updatedSession);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid session data", details: error.errors });
      }
      console.error("Error updating session:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // ============ QUIZ ANSWERS API ============

  // Record a quiz answer
  app.post("/api/quiz-answers", async (req, res) => {
    try {
      const answerData = insertQuizAnswerSchema.parse(req.body);
      const answer = await storage.createQuizAnswer(answerData);
      res.status(201).json(answer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid answer data", details: error.errors });
      }
      console.error("Error recording answer:", error);
      res.status(500).json({ error: "Failed to record answer" });
    }
  });

  // Get all quiz answers
  app.get("/api/quiz-answers", async (req, res) => {
    try {
      const answers = await storage.getAllQuizAnswers();
      res.json(answers);
    } catch (error) {
      console.error("Error fetching quiz answers:", error);
      res.status(500).json({ error: "Failed to fetch quiz answers" });
    }
  });

  // Get quiz answers by session
  app.get("/api/quiz-answers/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const answers = await storage.getQuizAnswersBySession(sessionId);
      res.json(answers);
    } catch (error) {
      console.error("Error fetching answers by session:", error);
      res.status(500).json({ error: "Failed to fetch answers by session" });
    }
  });

  // Get quiz answers by card
  app.get("/api/quiz-answers/card/:cardId", async (req, res) => {
    try {
      const { cardId } = req.params;
      const answers = await storage.getQuizAnswersByCard(cardId);
      res.json(answers);
    } catch (error) {
      console.error("Error fetching answers by card:", error);
      res.status(500).json({ error: "Failed to fetch answers by card" });
    }
  });

  // ============ ANALYTICS API ============

  // Get analytics data with aggregations
  app.get("/api/analytics", async (req, res) => {
    try {
      const cards = await storage.getAllCards();
      const quizAnswers = await storage.getAllQuizAnswers();
      const allFeedback = await storage.getAllFeedback();

      // Group quiz answers by card
      const cardStatsMap = new Map();

      // Initialize stats for each card
      cards.forEach(card => {
        cardStatsMap.set(card.id, {
          cardId: card.id,
          question: card.domanda,
          category: card.categoria,
          color: card.colore,
          totalAnswers: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          correctPercentage: 0,
          wrongPercentage: 0,
          avgResponseTime: 0,
          // Feedback counts (the 6 options)
          reviewCount: 0,
          topCount: 0,
          easyCount: 0,
          hardCount: 0,
          funCount: 0,
          boringCount: 0,
          totalFeedback: 0
        });
      });

      // Process quiz answers
      quizAnswers.forEach(answer => {
        const stats = cardStatsMap.get(answer.cardId);
        if (stats) {
          stats.totalAnswers++;
          if (answer.correct) {
            stats.correctAnswers++;
          } else {
            stats.wrongAnswers++;
          }
        }
      });

      // Process feedback
      allFeedback.forEach(fb => {
        const stats = cardStatsMap.get(fb.cardId);
        if (stats) {
          if (fb.review) stats.reviewCount++;
          if (fb.top) stats.topCount++;
          if (fb.easy) stats.easyCount++;
          if (fb.hard) stats.hardCount++;
          if (fb.fun) stats.funCount++;
          if (fb.boring) stats.boringCount++;
          // Count how many feedback options were selected in this feedback entry
          const feedbackOptionsCount = [fb.review, fb.top, fb.easy, fb.hard, fb.fun, fb.boring]
            .filter(Boolean).length;
          stats.totalFeedback += feedbackOptionsCount;
        }
      });

      // Calculate percentages and filter cards with minimum 1 feedback
      const cardStats = Array.from(cardStatsMap.values())
        .map(stats => {
          if (stats.totalAnswers > 0) {
            stats.correctPercentage = Math.round((stats.correctAnswers / stats.totalAnswers) * 100);
            stats.wrongPercentage = Math.round((stats.wrongAnswers / stats.totalAnswers) * 100);
          }
          return stats;
        })
        .filter(stats => stats.totalFeedback >= 1 || stats.totalAnswers >= 1); // Show if at least 1 feedback/answer

      // Sort by top votes (most voted cards)
      const topVotedCards = [...cardStats]
        .sort((a, b) => b.topCount - a.topCount)
        .slice(0, 10);

      // Sort by correct percentage
      const bestPerformingCards = [...cardStats]
        .filter(s => s.totalAnswers >= 1)
        .sort((a, b) => b.correctPercentage - a.correctPercentage)
        .slice(0, 10);

      // Sort by wrong percentage (most difficult)
      const mostDifficultCards = [...cardStats]
        .filter(s => s.totalAnswers >= 1)
        .sort((a, b) => b.wrongPercentage - a.wrongPercentage)
        .slice(0, 10);

      // Overall statistics
      const totalQuizAnswers = quizAnswers.length;
      const totalCorrect = quizAnswers.filter(a => a.correct).length;
      const totalWrong = totalQuizAnswers - totalCorrect;
      const overallCorrectPercentage = totalQuizAnswers > 0
        ? Math.round((totalCorrect / totalQuizAnswers) * 100)
        : 0;

      const response = {
        overview: {
          totalCards: cards.length,
          totalQuizAnswers,
          totalCorrect,
          totalWrong,
          overallCorrectPercentage,
          totalFeedbackEntries: allFeedback.length
        },
        cardStats, // All cards with stats (filtered by minimum 2 feedback)
        topVotedCards,
        bestPerformingCards,
        mostDifficultCards,
        feedbackSummary: {
          totalReview: allFeedback.reduce((sum, f) => sum + (f.review ? 1 : 0), 0),
          totalTop: allFeedback.reduce((sum, f) => sum + (f.top ? 1 : 0), 0),
          totalEasy: allFeedback.reduce((sum, f) => sum + (f.easy ? 1 : 0), 0),
          totalHard: allFeedback.reduce((sum, f) => sum + (f.hard ? 1 : 0), 0),
          totalFun: allFeedback.reduce((sum, f) => sum + (f.fun ? 1 : 0), 0),
          totalBoring: allFeedback.reduce((sum, f) => sum + (f.boring ? 1 : 0), 0)
        }
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Export cards to CSV
  app.get("/api/admin/export-csv", async (req, res) => {
    try {
      const cards = await storage.getAllCards();
      
      // Create CSV header
      const csvHeader = "id,colore,categoria,domanda,opzioneA,opzioneB,opzioneC,corretta,battuta\n";
      
      // Convert cards to CSV format
      const csvContent = cards.map(card => {
        const row = [
          `#${card.id}`,
          card.colore,
          card.categoria,
          `"${card.domanda.replace(/"/g, '""')}"`,
          card.opzioneA ? `"${card.opzioneA.replace(/"/g, '""')}"` : "",
          card.opzioneB ? `"${card.opzioneB.replace(/"/g, '""')}"` : "",
          card.opzioneC ? `"${card.opzioneC.replace(/"/g, '""')}"` : "",
          card.corretta || "",
          card.battuta ? `"${card.battuta.replace(/"/g, '""')}"` : ""
        ];
        return row.join(",");
      }).join("\n");
      
      const fullCsv = csvHeader + csvContent;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="fluffy-trivia-cards.csv"');
      res.send(fullCsv);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      res.status(500).json({ error: "Failed to export CSV" });
    }
  });

  // Import cards from CSV (DISABLED in production for security)
  app.post("/api/admin/import-csv", (req, res, next) => {
    upload.single('csvFile')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: "File troppo grande (max 5MB)" });
        }
        if (err.message === 'Solo file CSV sono permessi') {
          return res.status(400).json({ error: "Solo file CSV sono permessi" });
        }
        return res.status(400).json({ error: "Errore upload file: " + err.message });
      }
      next();
    });
  }, async (req, res) => {
    // Security: Disable in production
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: "Import endpoint disabled in production" });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nessun file CSV caricato" });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      
      // Parse CSV with proper quote handling
      const records = parse(csvContent, {
        columns: ['id', 'colore', 'categoria', 'domanda', 'opzioneA', 'opzioneB', 'opzioneC', 'corretta', 'battuta'],
        skip_empty_lines: true,
        from_line: 2 // Skip header
      });
      
      let imported = 0;
      let errors = [];
      
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const rowNumber = i + 2; // Line number in CSV (accounting for header)
        
        try {
          // Clean and prepare data
          const rawCardData = {
            id: (record.id || '').toString().replace(/^#/, '').trim(), // Remove # prefix
            categoria: (record.categoria || '').trim(),
            colore: (record.colore || '').toLowerCase().trim(),
            domanda: (record.domanda || '').trim(),
            opzioneA: record.opzioneA?.trim() || undefined,
            opzioneB: record.opzioneB?.trim() || undefined,
            opzioneC: record.opzioneC?.trim() || undefined,
            corretta: record.corretta?.trim() || undefined,
            battuta: record.battuta?.trim() || undefined,
            tipo: (record.opzioneA && record.opzioneB && record.opzioneC) ? "quiz" : "speciale"
          };

          // Validate using schema
          const validationResult = insertCardSchema.safeParse(rawCardData);
          
          if (!validationResult.success) {
            errors.push({ 
              row: rowNumber, 
              id: rawCardData.id, 
              error: `Validation failed: ${validationResult.error.errors.map(e => e.message).join(', ')}` 
            });
            continue;
          }

          await storage.createCard(validationResult.data);
          imported++;
        } catch (error) {
          console.error(`Error importing card at row ${rowNumber}:`, error);
          errors.push({ 
            row: rowNumber, 
            id: record.id || 'unknown', 
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      res.json({ 
        message: `Successfully imported ${imported} cards`, 
        imported, 
        errors: errors.slice(0, 10) // Show first 10 errors
      });
    } catch (error) {
      console.error("Error importing CSV:", error);
      res.status(500).json({ error: "Failed to import CSV", details: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

