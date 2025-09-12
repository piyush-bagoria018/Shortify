import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: "*",
  })
);

app.use(express.json());

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log file path
const logFilePath = path.join(__dirname, "logs.json");

let logs = []; // still keep for GET

// HTTP endpoint for backend logging
app.post("/log", (req, res) => {
  const { service, level, module, message, timestamp } = req.body;

  if (!service || !level || !module || !message) {
    return res.status(400).json({ error: "Missing Fields" });
  }

  const logEntry = {
    id: logs.length + 1,
    time: timestamp || new Date().toISOString(),
    stack: service,
    level,
    package: module,
    message,
  };

  // 1. Save in memory (for viewing through GET /logs)
  logs.push(logEntry);

  // 2. Write the entire logs array to logs.json as valid JSON
  fs.writeFile(logFilePath, JSON.stringify(logs, null, 2), (err) => {
    if (err) {
      console.error("❌ Failed to write log to file:", err.message);
    }
  });

  res.status(201).json({
    logId: logEntry.id,
    message: "Log Created Successfully",
  });
});

app.get("/logs", (req, res) => {
  res.json(logs);
});

export { app };
