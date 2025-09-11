import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { Log } from "../../../Logging-middleware/utils/logger.js";

export const authenticate = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
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
