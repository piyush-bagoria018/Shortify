import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Log, logMiddleware } from "./utils/httpLogger.js";

const app = express();

app.use(logMiddleware);

// Basic middleware - Enhanced CORS configuration for production
const isDev = process.env.NODE_ENV !== "production";
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "https://shortify-7l1m.vercel.app",
  /^https:\/\/shortify-.*\.vercel\.app$/, // Allow all Vercel preview deployments
  // Local development origins
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // In development, allow all origins for easy local testing
      if (isDev) return callback(null, true);

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if the origin is in our allowed list
      const isAllowed = allowedOrigins.some((allowedOrigin) => {
        if (typeof allowedOrigin === "string") {
          return origin === allowedOrigin;
        }
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        Log("backend", "warn", "cors", `CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
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

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  // Handle ApiError specifically
  if (err.statuscode) {
    Log(
      "backend",
      "warn",
      "app",
      `API Error: ${err.message} (${err.statuscode})`
    );
    return res.status(err.statuscode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
      timestamp: new Date().toISOString(),
    });
  }

  // Handle other errors
  Log("backend", "fatal", "app", `Unhandled error: ${err.message}`);
  console.error("Error stack:", err.stack);

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong on the server."
        : err.message,
    timestamp: new Date().toISOString(),
  });
});

export { app };
// Force restart
