import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pool } from "./db.js";

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json({ limit: "10kb" }));

const writeLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20 });

app.get("/api/commands", async (req, res) => {
  const q = String(req.query.q ?? "").trim().slice(0, 100);
  try {
    if (!q) {
      const { rows } = await pool.query(
        "SELECT id, command, description FROM commands ORDER BY created_at DESC LIMIT 20"
      );
      return res.json(rows);
    }
    const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
    const { rows } = await pool.query(
      `SELECT id, command, description,
              GREATEST(similarity(command, $1), word_similarity($1, description)) AS score
       FROM commands
       WHERE command ILIKE $2 OR description ILIKE $2
          OR $1 % command OR $1 <% description
       ORDER BY (command ILIKE $2) DESC, score DESC
       LIMIT 20`,
      [q, like]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

app.post("/api/commands", writeLimiter, async (req, res) => {
  const command = String(req.body?.command ?? "").trim();
  const description = String(req.body?.description ?? "").trim();
  if (!command || command.length > 200)
    return res.status(400).json({ error: "Command must be 1-200 characters" });
  if (description.length < 3 || description.length > 500)
    return res.status(400).json({ error: "Description must be 3-500 characters" });
  try {
    const { rows } = await pool.query(
      "INSERT INTO commands (command, description) VALUES ($1, $2) RETURNING id, command, description",
      [command, description]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(409).json({ error: "That command already exists" });
    console.error(err);
    res.status(500).json({ error: "Could not save command" });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("API running"));