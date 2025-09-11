import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { Log } from "../../../Logging-middleware/utils/logger.js";
import EmailService from "../services/email.service.js";
import OTPService from "../services/otp.service.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

// Register new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    await Log(
      "backend",
      "info",
      "auth.controller",
      `Register attempt for email: ${email || "<missing>"}`
    );
    if (!name || !email || !password) {
      await Log(
        "backend",
        "warn",
        "auth.controller",
        "Registration failed: Missing name/email/password"
      );
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }
    if (password.length < 6) {
      await Log(
        "backend",
        "warn",
        "auth.controller",
        `Registration failed for ${email}: Password too short`
      );
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await Log(
        "backend",
        "warn",
        "auth.controller",
        `Registration failed: User already exists for ${email}`
      );
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }
    const user = await User.create({ name, email, password });
    // Do NOT auto-login on register. No tokens/cookies here.
    await Log(
      "backend",
      "info",
      "auth.controller",
      `Registration successful (no auto-login): userId=${user._id} email=${user.email}`
    );
    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please log in to continue.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          urlsCreated: user.urlsCreated,
          urlLimit: user.urlLimit,
          selectedAvatar: user.selectedAvatar,
        },
      },
    });
  } catch (error) {
    await Log(
      "backend",
      "fatal",
      "auth.controller",
      `Registration error for ${req.body?.email || "<unknown>"}: ${
        error.message
      }`
    );
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    await Log(
      "backend",
      "info",
      "auth.controller",
      `Login attempt for email: ${email || "<missing>"}`
    );
    if (!email || !password) {
      await Log(
        "backend",
        "warn",
        "auth.controller",
        "Login failed: Missing email/password"
      );
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      await Log(
        "backend",
        "warn",
        "auth.controller",
        `Login failed: User not found for ${email}`
      );
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      await Log(
        "backend",
        "warn",
        "auth.controller",
        `Login failed: Invalid credentials for ${email}`
      );
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);
    await Log(
      "backend",
      "info",
      "auth.controller",
      `Login successful: userId=${user._id} email=${user.email}`
    );
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          urlsCreated: user.urlsCreated,
          urlLimit: user.urlLimit,
          selectedAvatar: user.selectedAvatar,
        },
      },
    });
  } catch (error) {
    await Log(
      "backend",
      "fatal",
      "auth.controller",
      `Login error for ${req.body?.email || "<unknown>"}: ${error.message}`
    );
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      await Log(
        "backend",
        "warn",
        "auth.controller",
        "Get current user failed: user not found on request"
      );
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    await Log(
      "backend",
      "info",
      "auth.controller",
      `Get current user: userId=${user._id}`
    );
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          urlsCreated: user.urlsCreated,
          urlLimit: user.urlLimit,
          selectedAvatar: user.selectedAvatar,
          bio: user.bio,
          location: user.location,
          website: user.website,
          dateOfBirth: user.dateOfBirth,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    await Log(
      "backend",
      "fatal",
      "auth.controller",
      `Get current user error: ${error.message}`
    );
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Logout user
export const logoutUser = async (req, res) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $set: { refreshToken: undefined },
      });
    }
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    await Log(
      "backend",
      "info",
      "auth.controller",
      `Logout successful${req.user ? `: userId=${req.user._id}` : ""}`
    );
    return res
      .status(200)
      .json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    await Log(
      "backend",
      "fatal",
      "auth.controller",
      `Logout error: ${error.message}`
    );
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Refresh token
export const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      await Log(
        "backend",
        "warn",
        "auth.controller",
        "Refresh token failed: No refresh token provided"
      );
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized Request" });
    }
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET || "dev-refresh-secret"
    );
    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      await Log(
        "backend",
        "warn",
        "auth.controller",
        "Refresh token failed: Token mismatch or user not found"
      );
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);
    await Log(
      "backend",
      "info",
      "auth.controller",
      `Access token refreshed for userId=${user._id}`
    );
    return res
      .status(200)
      .json({ success: true, message: "Access token refreshed" });
  } catch (error) {
    await Log(
      "backend",
      "warn",
      "auth.controller",
      `Refresh token error: ${error.message}`
    );
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired refresh token" });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const {
      username,
      email,
      selectedAvatar,
      bio,
      location,
      website,
      dateOfBirth,
    } = req.body;
    const userId = req.user._id;

    await Log(
      "backend",
      "info",
      "auth.controller",
      `Profile update attempt for userId: ${userId}`
    );

    // Validate required fields for basic info update
    if (
      !username &&
      !email &&
      selectedAvatar === undefined &&
      !bio &&
      !location &&
      !website &&
      !dateOfBirth
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prepare update data
    const updateData = {};

    // Update basic info
    if (username) updateData.name = username;
    if (selectedAvatar !== undefined)
      updateData.selectedAvatar = selectedAvatar;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (email) {
      // Check if email already exists
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
      updateData.email = email;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -refreshToken");

    await Log(
      "backend",
      "info",
      "auth.controller",
      `Profile updated successfully for userId: ${userId}`
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    await Log(
      "backend",
      "error",
      "auth.controller",
      `Profile update error: ${error.message}`
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Change user password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    await Log(
      "backend",
      "info",
      "auth.controller",
      `Password change attempt for userId: ${userId}`
    );

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current password and new password",
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.isPasswordCorrect(
      currentPassword
    );
    if (!isCurrentPasswordValid) {
      await Log(
        "backend",
        "warn",
        "auth.controller",
        `Invalid current password for userId: ${userId}`
      );
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Check if new password is different from current
    const isSamePassword = await user.isPasswordCorrect(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    await Log(
      "backend",
      "info",
      "auth.controller",
      `Password changed successfully for userId: ${userId}`
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    await Log(
      "backend",
      "error",
      "auth.controller",
      `Password change error: ${error.message}`
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Forgot Password - Send OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    await Log(
      "backend",
      "info",
      "auth.controller",
      `Forgot password request for email: ${email}`
    );

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if email exists
      return res.status(200).json({
        success: true,
        message:
          "If your email is registered, you will receive a reset code shortly",
      });
    }

    // Check rate limiting
    const rateLimit = OTPService.checkRateLimit(
      user.passwordResetAttempts,
      user.passwordResetLastAttempt
    );

    if (!rateLimit.allowed) {
      await Log(
        "backend",
        "warn",
        "auth.controller",
        `Rate limit exceeded for forgot password: ${email}`
      );
      return res.status(429).json({
        success: false,
        message: `Too many reset attempts. Please try again after ${rateLimit.resetTime.toLocaleTimeString()}`,
      });
    }

    // Generate OTP
    const otp = OTPService.generateOTP();
    const hashedOTP = await OTPService.hashOTP(otp);
    const otpExpiration = OTPService.getOTPExpiration();

    // Update user with OTP data
    user.passwordResetOTP = hashedOTP;
    user.passwordResetOTPExpires = otpExpiration;
    user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;
    user.passwordResetLastAttempt = new Date();
    await user.save();

    // Send email with OTP
    try {
      await EmailService.sendPasswordResetOTP(email, user.name, otp);

      await Log(
        "backend",
        "info",
        "auth.controller",
        `Password reset OTP sent successfully to: ${email}`
      );

      res.status(200).json({
        success: true,
        message: "Reset code sent to your email. Please check your inbox.",
        data: {
          email: email,
          expiresIn: "10 minutes",
        },
      });
    } catch (emailError) {
      await Log(
        "backend",
        "error",
        "auth.controller",
        `Failed to send email to ${email}: ${emailError.message}`
      );

      res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again later.",
      });
    }
  } catch (error) {
    await Log(
      "backend",
      "error",
      "auth.controller",
      `Forgot password error: ${error.message}`
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Verify Reset OTP
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    await Log(
      "backend",
      "info",
      "auth.controller",
      `OTP verification attempt for email: ${email}`
    );

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and verification code",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user || !user.passwordResetOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    // Check if OTP is expired
    if (OTPService.isOTPExpired(user.passwordResetOTPExpires)) {
      // Clear expired OTP
      user.passwordResetOTP = undefined;
      user.passwordResetOTPExpires = undefined;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Verify OTP
    const isValidOTP = await OTPService.verifyOTP(otp, user.passwordResetOTP);
    if (!isValidOTP) {
      await Log(
        "backend",
        "warn",
        "auth.controller",
        `Invalid OTP attempt for email: ${email}`
      );
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Generate reset token
    const resetToken = OTPService.generateResetToken();

    // Store reset token (replace OTP with token)
    user.passwordResetOTP = resetToken;
    user.passwordResetOTPExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes for password reset
    await user.save();

    await Log(
      "backend",
      "info",
      "auth.controller",
      `OTP verified successfully for email: ${email}`
    );

    res.status(200).json({
      success: true,
      message: "Verification code confirmed. You can now reset your password.",
      data: {
        resetToken: resetToken,
        expiresIn: "30 minutes",
      },
    });
  } catch (error) {
    await Log(
      "backend",
      "error",
      "auth.controller",
      `OTP verification error: ${error.message}`
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Reset Password with Token
export const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    await Log(
      "backend",
      "info",
      "auth.controller",
      `Password reset attempt for email: ${email}`
    );

    // Validate input
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, reset token, and new password",
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Find user and verify reset token
    const user = await User.findOne({
      email,
      passwordResetOTP: resetToken,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Check if token is expired
    if (OTPService.isOTPExpired(user.passwordResetOTPExpires)) {
      // Clear expired token
      user.passwordResetOTP = undefined;
      user.passwordResetOTPExpires = undefined;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "Reset token has expired. Please start the process again.",
      });
    }

    // Update password
    user.password = newPassword;

    // Clear reset data
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    user.passwordResetAttempts = 0;
    user.passwordResetLastAttempt = undefined;

    await user.save();

    await Log(
      "backend",
      "info",
      "auth.controller",
      `Password reset successful for email: ${email}`
    );

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    await Log(
      "backend",
      "error",
      "auth.controller",
      `Password reset error: ${error.message}`
    );
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
