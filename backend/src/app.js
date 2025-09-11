import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Log } from "../../Logging-middleware/utils/logger.js";
import { logMiddleware } from "../../Logging-middleware/middleware/middleware.js";

const app = express();

app.use(logMiddleware);

// Basic middleware
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  // Loopback variations
  // "http://127.0.0.1:3000",
  // "http://127.0.0.1:3001",
  // "http://127.0.0.1:3002",
  // LAN dev access (optional)
  "http://192.168.0.100:3000",
  "http://192.168.0.100:3001",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or curl with no Origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

// Apply CORS and handle preflight
app.use(cors(corsOptions));
// Express v5 no longer supports "*" path; use a RegExp to match all
app.options(/^.*$/, cors(corsOptions));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Import routes
import urlRouter from "./routes/url.routes.js";
import authRoutes from "./routes/auth.routes.js";

// Use routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/shorturls", urlRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  Log("backend", "info", "route", "Health check accessed");
  res.status(200).json({
    success: true,
    message: "URL Shortener service is running",
    timestamp: new Date().toISOString(),
  });
});

// Simple error handling
app.use((err, req, res, next) => {
  Log("backend", "fatal", "app", `Unhandled error: ${err.message}`);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server.",
    timestamp: new Date().toISOString(),
  });
});

export { app };
// Force restart
