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
router.put("/profile", authenticate, updateProfile);
router.patch("/change-password", authenticate, changePassword);

export default router;
