import apiRoutes from "./src/server/routes.js";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { login, logout } from "./src/server/authController.js";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use("/api", apiRoutes);

// Ensure persistent data directory exists
const DB_DIR = path.join(process.env.NODE_ENV === "production" ? "/tmp" : process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "radius_db.json");

interface ServerDb {
  lastUpdated: number;
  data: Record<string, any>;
}

let dbStore: ServerDb = {
  lastUpdated: 0,
  data: {}
};

// Load initial database from disk
try {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        dbStore = parsed;
        console.log(`[RADIUS Server] Loaded persistent state from disk. Last updated: ${new Date(dbStore.lastUpdated || Date.now()).toISOString()}`);
      }
    }
  }
} catch (e) {
  console.warn("[RADIUS Server] Failed to load db from disk:", e);
}

function saveDbToDisk() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbStore, null, 2), "utf-8");
  } catch (e) {
    console.error("[RADIUS Server] Error saving db to disk:", e);
  }
}

// Disable response caching for API routes
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// API Routes
app.post("/api/login", login);
app.post("/api/logout", logout);

// Get current sync version timestamp
app.get("/api/sync/version", (req, res) => {
  res.json({ lastUpdated: dbStore.lastUpdated || 0 });
});

// Get full current synced state
app.get("/api/sync", (req, res) => {
  res.json({
    lastUpdated: dbStore.lastUpdated || 0,
    data: dbStore.data || {}
  });
});

// Post state updates (full or partial)
app.post("/api/sync", (req, res) => {
  try {
    const { data, timestamp } = req.body || {};
    if (data && typeof data === "object") {
      dbStore.data = {
        ...dbStore.data,
        ...data
      };
      dbStore.lastUpdated = typeof timestamp === "number" ? timestamp : Date.now();
      saveDbToDisk();
      console.log(`[RADIUS Server] Synced data updated. Timestamp: ${dbStore.lastUpdated}`);
    }
    res.json({ success: true, lastUpdated: dbStore.lastUpdated });
  } catch (e: any) {
    console.error("[RADIUS Server] Error in /api/sync:", e);
    res.status(500).json({ error: e.message || "Failed to sync" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RADIUS Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
