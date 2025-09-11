import crypto from "crypto";
import bcrypt from "bcryptjs";

class OTPService {
  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Hash OTP for secure storage
  async hashOTP(otp) {
    return await bcrypt.hash(otp, 12);
  }

  // Verify OTP against hash
  async verifyOTP(otp, hashedOTP) {
    return await bcrypt.compare(otp, hashedOTP);
  }

  // Generate OTP expiration time (10 minutes from now)
  getOTPExpiration() {
    return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  }

  // Check if OTP is expired
  isOTPExpired(expirationDate) {
    return new Date() > expirationDate;
  }

  // Generate secure reset token for password reset flow
  generateResetToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  // Check rate limiting (max 3 attempts per hour)
  checkRateLimit(attempts, lastAttempt) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Reset attempts if last attempt was more than 1 hour ago
    if (!lastAttempt || lastAttempt < oneHourAgo) {
      return { allowed: true, remainingAttempts: 3 };
    }

    // Check if user has exceeded attempts
    if (attempts >= 3) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: new Date(lastAttempt.getTime() + 60 * 60 * 1000),
      };
    }

    return { allowed: true, remainingAttempts: 3 - attempts };
  }
}

export default new OTPService();
