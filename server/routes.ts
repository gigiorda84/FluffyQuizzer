import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCardSchema, insertFeedbackSchema } from "@shared/schema";
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
      const cardData = insertCardSchema.partial().parse(req.body);
      const updatedCard = await storage.updateCard(id, cardData);
      
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

