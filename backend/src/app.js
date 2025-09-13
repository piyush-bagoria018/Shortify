import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Log, logMiddleware } from "./utils/httpLogger.js";

const app = express();

app.use(logMiddleware);

// Basic middleware - Enhanced CORS configuration for production
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'https://shortify-7l1m.vercel.app',
  /^https:\/\/shortify-.*\.vercel\.app$/, // Allow all Vercel preview deployments
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if the origin is in our allowed list
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (typeof allowedOrigin === 'string') {
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
        Log('backend', 'warn', 'cors', `CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
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
