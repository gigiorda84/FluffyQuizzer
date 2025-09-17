import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCardSchema, insertFeedbackSchema } from "@shared/schema";
import { z } from "zod";
import fs from "fs";
import path from "path";

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

  // Import cards from CSV (DISABLED in production for security)
  app.post("/api/admin/import-csv", async (req, res) => {
    // Security: Disable in production
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: "Import endpoint disabled in production" });
    }
    try {
      const csvPath = path.join(process.cwd(), "attached_assets", "domande_1758145253067.csv");
      
      if (!fs.existsSync(csvPath)) {
        return res.status(404).json({ error: "CSV file not found" });
      }

      const csvContent = fs.readFileSync(csvPath, "utf-8");
      const lines = csvContent.split("\n").slice(1); // Skip header
      
      let imported = 0;
      let errors = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        // Parse CSV line (handling quotes and commas)
        const columns = parseCSVLine(line);
        
        if (columns.length < 9) {
          continue;
        }

        const [id, colore, categoria, domanda, opzioneA, opzioneB, opzioneC, corretta, battuta] = columns;
        
        const cardData = {
          id: id.replace("#", ""), // Remove # from ID
          categoria,
          colore: colore.toLowerCase(),
          domanda,
          opzioneA: opzioneA || null,
          opzioneB: opzioneB || null,
          opzioneC: opzioneC || null,
          corretta: (opzioneA && opzioneB && opzioneC) ? corretta : null,
          battuta: battuta || null,
          tipo: (opzioneA && opzioneB && opzioneC) ? "quiz" : "speciale"
        };

        try {
          await storage.createCard(cardData);
          imported++;
        } catch (error) {
          console.error(`Error importing card ${id}:`, error);
          errors.push({ id, error: error.message });
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

// Helper function to parse CSV line with proper quote handling
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result.map(col => col.replace(/^"(.*)"$/, '$1')); // Remove quotes
}
