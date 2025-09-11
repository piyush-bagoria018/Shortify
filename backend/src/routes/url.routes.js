import express from "express";
import {
  createShortUrl,
  getUrlStats,
  redirectToOriginalUrl,
  getUserUrls,
  toggleUrlStatus,
  deleteUrl,
  updateUrl,
  bulkDeleteUrls,
  bulkToggleUrls,
  getUserAnalytics,
} from "../controllers/url.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Middleware to optionally authenticate (for URL creation)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const hasBearer = authHeader && authHeader.startsWith("Bearer ");
  const hasCookie = Boolean(req.cookies?.accessToken);
  if (hasBearer || hasCookie) {
    return authenticate(req, res, next);
  }
  next();
};

// Public routes
router.post("/", optionalAuth, createShortUrl); // Allow both authenticated and anonymous URL creation
router.get("/stats/:shortcode", getUrlStats);

// Protected routes (require authentication)
router.get("/user/urls", authenticate, getUserUrls); // Get user's URLs
router.get("/user/analytics", authenticate, getUserAnalytics); // Get real analytics
router.patch("/:shortcode/toggle", authenticate, toggleUrlStatus); // Toggle URL status
router.delete("/:shortcode", authenticate, deleteUrl); // Delete URL
router.patch("/:shortcode", authenticate, updateUrl); // Update URL (edit)
router.post("/bulk/delete", authenticate, bulkDeleteUrls); // Bulk delete by shortCodes
router.post("/bulk/toggle", authenticate, bulkToggleUrls); // Bulk toggle by shortCodes

// 🚀 Redirect route (must be last to avoid conflicts)
router.get("/:shortcode", redirectToOriginalUrl);

export default router;
