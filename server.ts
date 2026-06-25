import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Set high limit for body parsing because profile images can be custom base64-encoded DataURIs
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, "users.json");

// Helper to read JSON safely
function readJsonFile<T>(filePath: string, defaultValue: T): T {
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return defaultValue;
  }
}

// Helper to write JSON safely
function writeJsonFile<T>(filePath: string, data: T): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
    return false;
  }
}

// API ROUTE 1: Get the global list of users (for leaderboard & users database)
app.get("/api/users", (req, res) => {
  const users = readJsonFile<any[]>(USERS_FILE, []);
  res.json(users);
});

// API ROUTE 2: Update the global list of users (e.g. register, profile update)
app.post("/api/users", (req, res) => {
  const users = req.body;
  if (!Array.isArray(users)) {
    return res.status(400).json({ error: "Invalid users payload. Must be an array." });
  }
  const success = writeJsonFile(USERS_FILE, users);
  if (success) {
    res.json({ success: true, count: users.length });
  } else {
    res.status(500).json({ error: "Failed to save users database on the server." });
  }
});

// API ROUTE 3: Get specific user's synced vocabulary data
app.get("/api/sync/:userId", (req, res) => {
  const { userId } = req.params;
  const cleanUserId = userId.replace(/[^a-zA-Z0-9_.-]/g, ""); // sanitize filename
  const userFile = path.join(DATA_DIR, `user_data_${cleanUserId}.json`);
  
  if (!fs.existsSync(userFile)) {
    return res.json({ found: false, data: null });
  }
  
  const userData = readJsonFile<any>(userFile, null);
  res.json({ found: true, data: userData });
});

// API ROUTE 4: Save/Sync specific user's vocabulary data
app.post("/api/sync/:userId", (req, res) => {
  const { userId } = req.params;
  const cleanUserId = userId.replace(/[^a-zA-Z0-9_.-]/g, ""); // sanitize filename
  const userFile = path.join(DATA_DIR, `user_data_${cleanUserId}.json`);
  
  const payload = req.body; // should contain { words, categories, history, streak, lastStudyDate }
  const success = writeJsonFile(userFile, payload);
  
  if (success) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: "Failed to save user data on the server." });
  }
});

// Start server with Vite middleware support
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
