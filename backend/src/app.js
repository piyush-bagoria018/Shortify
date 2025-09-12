import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Log } from "../../Logging-middleware/utils/logger.js";
import { logMiddleware } from "../../Logging-middleware/middleware/middleware.js";

const app = express();

app.use(logMiddleware);

// Basic middleware - Simple CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

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
