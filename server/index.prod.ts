import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log } from "./utils";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const urlPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (urlPath.startsWith("/api")) {
      let logLine = `${req.method} ${urlPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize routes
await registerRoutes(app);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  console.error(err);
});

// Production static file serving
const distPath = path.resolve(import.meta.dirname, "public");

if (!fs.existsSync(distPath)) {
  throw new Error(
    `Could not find the build directory: ${distPath}, make sure to build the client first`,
  );
}

app.use(express.static(distPath));

// fall through to index.html if the file doesn't exist
app.use("*", (_req, res) => {
  res.sendFile(path.resolve(distPath, "index.html"));
});

// Start server for traditional hosting (Render, etc.)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  log(`Server running on port ${PORT}`);
});

// Export for Vercel serverless
export default app;
