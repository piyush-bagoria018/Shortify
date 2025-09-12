import { Resend } from "resend";
import { Log } from "../utils/httpLogger.js";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

class EmailService {
  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || "noreply@shortify.com";
    this.fromName = process.env.FROM_NAME || "Shortify";
  }

  async sendPasswordResetOTP(email, name, otp) {
    try {
      const subject = "Your Shortify Password Reset Code";
      const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #18181b; color: #fff; padding: 32px; border-radius: 16px;">
          <h2 style="color: #feca57;">Password Reset Request</h2>
          <p>Hi ${name || "User"},</p>
          <p>Use the code below to reset your password. This code is valid for 10 minutes.</p>
          <div style="font-size: 2rem; font-weight: bold; color: #ff6b6b; margin: 24px 0; letter-spacing: 8px;">${otp}</div>
          <p>If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;" />
          <p style="font-size: 0.9rem; color: #888;">Shortify &copy; 2025</p>
        </div>
      `;

      await resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject,
        html,
      });

      await Log(
        "backend",
        "info",
        "email.service",
        `Password reset OTP sent successfully to ${email}`
      );

      return { success: true };
    } catch (error) {
      await Log(
        "backend",
        "error",
        "email.service",
        `Failed to send password reset OTP to ${email}: ${error.message}`
      );

      throw new Error("Failed to send email");
    }
  }
}

export default new EmailService();
