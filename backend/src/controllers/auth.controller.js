import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { Log } from "../utils/httpLogger.js";
import EmailService from "../services/email.service.js";
import OTPService from "../services/otp.service.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Allow cross-site cookies in production
  path: "/",
  domain: process.env.NODE_ENV === "production" ? undefined : "localhost", // Don't set domain in production for cross-origin
};

// Register new user
export const registerUser = asyncHandler(async (req, res) => {
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
    throw new ApiError(400, "Please provide name, email, and password");
  }

  if (password.length < 6) {
    await Log(
      "backend",
      "warn",
      "auth.controller",
      `Registration failed for ${email}: Password too short`
    );
    throw new ApiError(400, "Password must be at least 6 characters long");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    await Log(
      "backend",
      "warn",
      "auth.controller",
      `Registration failed for ${email}: User already exists`
    );
    throw new ApiError(409, "User with this email already exists");
  }

  const user = await User.create({ name, email, password });
  // Do NOT auto-login on register. No tokens/cookies here.
  await Log(
    "backend",
    "info",
    "auth.controller",
    `Registration successful (no auto-login): userId=${user._id} email=${user.email}`
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      {
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
      "User registered successfully. Please log in to continue."
    )
  );
});

// Login user
export const loginUser = asyncHandler(async (req, res) => {
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
    throw new ApiError(400, "Please provide email and password");
  }

  const user = await User.findOne({ email });
  if (!user) {
    await Log(
      "backend",
      "warn",
      "auth.controller",
      `Login failed: User not found for ${email}`
    );
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    await Log(
      "backend",
      "warn",
      "auth.controller",
      `Login failed: Invalid password for ${email}`
    );
    throw new ApiError(401, "Invalid email or password");
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
    `Login successful: userId=${user._id} email=${user.email}, cookieOptions=${JSON.stringify(cookieOptions)}`
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
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
      "Login successful"
    )
  );
});

// Get current user
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    await Log(
      "backend",
      "warn",
      "auth.controller",
      "Get current user failed: user not found on request"
    );
    throw new ApiError(404, "User not found");
  }

  await Log(
    "backend",
    "info",
    "auth.controller",
    `Get current user: userId=${user._id}`
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
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
      "User data retrieved successfully"
    )
  );
});

// Logout user
export const logoutUser = asyncHandler(async (req, res) => {
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
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

// Refresh token
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    await Log(
      "backend",
      "warn",
      "auth.controller",
      "Refresh token failed: No refresh token provided"
    );
    throw new ApiError(401, "Unauthorized Request");
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
    throw new ApiError(401, "Invalid refresh token");
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
    .json(new ApiResponse(200, null, "Access token refreshed"));
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
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
    throw new ApiError(400, "Please provide at least one field to update");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Prepare update data
  const updateData = {};

  // Update basic info
  if (username) updateData.name = username;
  if (selectedAvatar !== undefined) updateData.selectedAvatar = selectedAvatar;
  if (bio !== undefined) updateData.bio = bio;
  if (location !== undefined) updateData.location = location;
  if (website !== undefined) updateData.website = website;
  if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
  if (email) {
    // Check if email already exists
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      throw new ApiError(400, "Email already exists");
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

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: updatedUser },
        "Profile updated successfully"
      )
    );
});

// Change user password
export const changePassword = asyncHandler(async (req, res) => {
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
    throw new ApiError(400, "Please provide current password and new password");
  }

  // Validate new password length
  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters long");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Verify current password
  const isCurrentPasswordValid = await user.isPasswordCorrect(currentPassword);
  if (!isCurrentPasswordValid) {
    await Log(
      "backend",
      "warn",
      "auth.controller",
      `Invalid current password for userId: ${userId}`
    );
    throw new ApiError(400, "Current password is incorrect");
  }

  // Check if new password is different from current
  const isSamePassword = await user.isPasswordCorrect(newPassword);
  if (isSamePassword) {
    throw new ApiError(
      400,
      "New password must be different from current password"
    );
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

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});

// Forgot Password - Send OTP
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await Log(
    "backend",
    "info",
    "auth.controller",
    `Forgot password request for email: ${email}`
  );

  // Validate email
  if (!email) {
    throw new ApiError(400, "Please provide your email address");
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    // For security, don't reveal if email exists
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "If your email is registered, you will receive a reset code shortly"
        )
      );
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
    throw new ApiError(
      429,
      `Too many reset attempts. Please try again after ${rateLimit.resetTime.toLocaleTimeString()}`
    );
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

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          email: email,
          expiresIn: "10 minutes",
        },
        "Reset code sent to your email. Please check your inbox."
      )
    );
  } catch (emailError) {
    await Log(
      "backend",
      "error",
      "auth.controller",
      `Failed to send email to ${email}: ${emailError.message}`
    );

    throw new ApiError(
      500,
      "Failed to send reset email. Please try again later."
    );
  }
});

// Verify Reset OTP
export const verifyResetOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  await Log(
    "backend",
    "info",
    "auth.controller",
    `OTP verification attempt for email: ${email}`
  );

  // Validate input
  if (!email || !otp) {
    throw new ApiError(400, "Please provide email and verification code");
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user || !user.passwordResetOTP) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  // Check if OTP is expired
  if (OTPService.isOTPExpired(user.passwordResetOTPExpires)) {
    // Clear expired OTP
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    await user.save();

    throw new ApiError(
      400,
      "Verification code has expired. Please request a new one."
    );
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
    throw new ApiError(400, "Invalid verification code");
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

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        resetToken: resetToken,
        expiresIn: "30 minutes",
      },
      "Verification code confirmed. You can now reset your password."
    )
  );
});

// Reset Password with Token
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, resetToken, newPassword } = req.body;

  await Log(
    "backend",
    "info",
    "auth.controller",
    `Password reset attempt for email: ${email}`
  );

  // Validate input
  if (!email || !resetToken || !newPassword) {
    throw new ApiError(
      400,
      "Please provide email, reset token, and new password"
    );
  }

  // Validate password length
  if (newPassword.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long");
  }

  // Find user and verify reset token
  const user = await User.findOne({
    email,
    passwordResetOTP: resetToken,
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  // Check if token is expired
  if (OTPService.isOTPExpired(user.passwordResetOTPExpires)) {
    // Clear expired token
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    await user.save();

    throw new ApiError(
      400,
      "Reset token has expired. Please start the process again."
    );
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

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Password reset successfully. You can now login with your new password."
      )
    );
});
