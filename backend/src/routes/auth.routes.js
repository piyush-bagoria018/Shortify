import express from "express";
import jwt from "jsonwebtoken";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  refreshAccessToken,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticate, logoutUser);
router.post("/refresh-token", refreshAccessToken);

// Password reset routes (public)
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/me", authenticate, getCurrentUser);
// Simple token check using Authorization header for SPA flows
router.get("/ping", (req, res) => {
  const auth = req.header("Authorization");
  if (!auth)
    return res.status(401).json({ success: false, message: "No auth header" });
  try {
    const token = auth.replace("Bearer ", "");
    const payload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || "dev-access-secret"
    );
    return res.json({ success: true, userId: payload._id });
  } catch (e) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
});

// Debug endpoint to check headers and cookies (no auth required)
router.get("/debug", (req, res) => {
  res.status(200).json({
    success: true,
    debug: {
      cookies: req.cookies,
      authHeader: req.header("Authorization") || req.headers?.authorization,
      nodeEnv: process.env.NODE_ENV,
      corsOrigin: process.env.CORS_ORIGIN,
      hasAccessTokenSecret: !!process.env.ACCESS_TOKEN_SECRET,
    },
    timestamp: new Date().toISOString(),
  });
});

// Test token validation (no auth required - for debugging)
router.post("/validate-token", (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, error: "No token provided" });
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || "dev-access-secret"
    );
    res.json({ success: true, decoded, valid: true });
  } catch (error) {
    res.json({ success: false, error: error.message, valid: false });
  }
});
router.put("/profile", authenticate, updateProfile);
router.patch("/change-password", authenticate, changePassword);

export default router;
