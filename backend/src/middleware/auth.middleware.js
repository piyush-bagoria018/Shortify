import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { Log } from "../utils/httpLogger.js";

export const authenticate = async (req, res, next) => {
  try {
    // Extract token from cookies or Authorization header
    let token = req.cookies?.accessToken;
    
    // If no cookie token, check Authorization header
    const authHeader = req.header("Authorization") || req.headers?.authorization;
    if (!token && authHeader) {
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove "Bearer " prefix
      } else if (authHeader.startsWith("bearer ")) {
        token = authHeader.substring(7); // Handle lowercase
      }
    }

    // Enhanced debug logging
    await Log(
      "backend",
      "debug",
      "middleware",
      `Auth check - Cookie token: ${token ? "present" : "none"}, Auth header: ${authHeader ? authHeader.substring(0, 20) + "..." : "none"}, Extracted token: ${token ? "present" : "none"}`
    );

    if (!token) {
      await Log(
        "backend",
        "warn",
        "middleware",
        `Authentication failed: No token provided. Cookies: ${JSON.stringify(req.cookies)}, Headers: ${JSON.stringify(req.headers?.authorization || req.header("Authorization"))}`
      );
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }
    try {
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || "dev-access-secret"
      );
      const user = await User.findById(decoded._id).select(
        "-password -refreshToken"
      );
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid token user" });
      }
      req.user = user;
      next();
    } catch (jwtError) {
      await Log(
        "backend",
        "warn",
        "middleware",
        `Authentication failed: Invalid token - ${jwtError.message}`
      );
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }
  } catch (error) {
    await Log(
      "backend",
      "fatal",
      "middleware",
      `Authentication error: ${error.message}`
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
