"use client";
import React, { useState } from "react";
import { buildApiUrl } from "@/config/api";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "otp" | "newPassword">("email");
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // Step 1: Send OTP to email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(buildApiUrl("/auth/forgot-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(data.message);
        setStep("otp");
      } else {
        setError(
          data.message || "Failed to send reset code. Please try again."
        );
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.otp || form.otp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(buildApiUrl("/auth/verify-reset-otp"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          otp: form.otp,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResetToken(data.data.resetToken);
        setMessage(data.message);
        setStep("newPassword");
      } else {
        setError(
          data.message || "Invalid verification code. Please try again."
        );
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.newPassword || !form.confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(buildApiUrl("/auth/reset-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          resetToken: resetToken,
          newPassword: form.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(data.message);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(data.message || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <>
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#feca57] via-[#ff6b6b] to-[#ff9ff3]">
          Forgot Password
        </h1>
        <p className="text-gray-400 text-sm">
          Enter your email address and we'll send you a verification code
        </p>
      </div>

      <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
        <div className="group">
          <label className="block text-gray-300 text-sm font-medium mb-2 group-focus-within:text-[#feca57] transition-colors duration-200">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#feca57] focus:ring-1 focus:ring-[#feca57] transition-all duration-200 backdrop-blur-sm"
            placeholder="Enter your email address"
            required
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2 px-3 border border-red-500/20">
            {error}
          </div>
        )}

        {message && (
          <div className="text-green-400 text-sm text-center bg-green-500/10 rounded-lg py-2 px-3 border border-green-500/20">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 bg-gradient-to-r from-[#feca57] via-[#ff6b6b] to-[#ff9ff3] text-white font-semibold py-3 rounded-lg shadow-[0_4px_20px_0_rgba(254,202,87,0.4)] hover:shadow-[0_6px_30px_0_rgba(254,202,87,0.5)] transition-all duration-300 text-base tracking-wide relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10">
            {loading ? "Sending Code..." : "Send Verification Code"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b6b] via-[#ff9ff3] to-[#feca57] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </form>
    </>
  );

  const renderOTPStep = () => (
    <>
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#feca57] via-[#ff6b6b] to-[#ff9ff3]">
          Verify Code
        </h1>
        <p className="text-gray-400 text-sm">
          Enter the 6-digit code sent to{" "}
          <span className="text-[#feca57]">{form.email}</span>
        </p>
      </div>

      <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
        <div className="group">
          <label className="block text-gray-300 text-sm font-medium mb-2 group-focus-within:text-[#feca57] transition-colors duration-200">
            Verification Code
          </label>
          <input
            type="text"
            name="otp"
            value={form.otp}
            onChange={handleChange}
            maxLength={6}
            className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#feca57] focus:ring-1 focus:ring-[#feca57] transition-all duration-200 backdrop-blur-sm text-center text-2xl tracking-widest"
            placeholder="000000"
            required
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2 px-3 border border-red-500/20">
            {error}
          </div>
        )}

        {message && (
          <div className="text-green-400 text-sm text-center bg-green-500/10 rounded-lg py-2 px-3 border border-green-500/20">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 bg-gradient-to-r from-[#feca57] via-[#ff6b6b] to-[#ff9ff3] text-white font-semibold py-3 rounded-lg shadow-[0_4px_20px_0_rgba(254,202,87,0.4)] hover:shadow-[0_6px_30px_0_rgba(254,202,87,0.5)] transition-all duration-300 text-base tracking-wide relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10">
            {loading ? "Verifying..." : "Verify Code"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b6b] via-[#ff9ff3] to-[#feca57] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>

        <button
          type="button"
          onClick={() => setStep("email")}
          className="w-full text-gray-400 text-sm underline hover:text-[#feca57] transition-colors duration-200"
        >
          Back to email entry
        </button>
      </form>
    </>
  );

  const renderPasswordStep = () => (
    <>
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#feca57] via-[#ff6b6b] to-[#ff9ff3]">
          Reset Password
        </h1>
        <p className="text-gray-400 text-sm">Enter your new password below</p>
      </div>

      <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
        <div className="group">
          <label className="block text-gray-300 text-sm font-medium mb-2 group-focus-within:text-[#feca57] transition-colors duration-200">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#feca57] focus:ring-1 focus:ring-[#feca57] transition-all duration-200 backdrop-blur-sm"
            placeholder="Enter new password"
            required
          />
        </div>

        <div className="group">
          <label className="block text-gray-300 text-sm font-medium mb-2 group-focus-within:text-[#feca57] transition-colors duration-200">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#feca57] focus:ring-1 focus:ring-[#feca57] transition-all duration-200 backdrop-blur-sm"
            placeholder="Confirm new password"
            required
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2 px-3 border border-red-500/20">
            {error}
          </div>
        )}

        {message && (
          <div className="text-green-400 text-sm text-center bg-green-500/10 rounded-lg py-2 px-3 border border-green-500/20">
            {message}
            <br />
            <span className="text-gray-400 text-xs">
              Redirecting to login page...
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 bg-gradient-to-r from-[#feca57] via-[#ff6b6b] to-[#ff9ff3] text-white font-semibold py-3 rounded-lg shadow-[0_4px_20px_0_rgba(254,202,87,0.4)] hover:shadow-[0_6px_30px_0_rgba(254,202,87,0.5)] transition-all duration-300 text-base tracking-wide relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10">
            {loading ? "Resetting Password..." : "Reset Password"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b6b] via-[#ff9ff3] to-[#feca57] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </form>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-[#feca57]/20 to-[#ff6b6b]/20 rounded-full mix-blend-screen filter blur-3xl animate-blob1" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-[#ff6b6b]/20 to-[#ff9ff3]/20 rounded-full mix-blend-screen filter blur-3xl animate-blob2" />
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-[#ff9ff3]/20 to-[#feca57]/20 rounded-full mix-blend-screen filter blur-3xl animate-blob3" />
      </div>

      {/* Main container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        {/* Enhanced forgot password card */}
        <div className="w-full max-w-md bg-gray-800/30 backdrop-blur-lg border border-gray-700/30 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#feca57]/10 via-[#ff6b6b]/10 to-[#ff9ff3]/10 rounded-2xl -m-px"></div>
          <div className="relative bg-gray-800/40 rounded-2xl p-6 backdrop-blur-sm">
            {step === "email" && renderEmailStep()}
            {step === "otp" && renderOTPStep()}
            {step === "newPassword" && renderPasswordStep()}

            {/* Back to login link */}
            <div className="text-center text-gray-400 text-sm pt-4">
              Remember your password?{" "}
              <a
                href="/login"
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#feca57] to-[#ff6b6b] font-medium underline hover:from-[#ff6b6b] hover:to-[#ff9ff3] transition-all duration-300"
              >
                Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blob1 {
          0%,
          100% {
            transform: translateY(0) scale(1) rotate(0deg);
          }
          33% {
            transform: translateY(-60px) scale(1.1) rotate(120deg);
          }
          66% {
            transform: translateY(30px) scale(0.9) rotate(240deg);
          }
        }
        @keyframes blob2 {
          0%,
          100% {
            transform: translateY(0) scale(1) rotate(0deg);
          }
          50% {
            transform: translateY(50px) scale(1.08) rotate(180deg);
          }
        }
        @keyframes blob3 {
          0%,
          100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          33% {
            transform: translate(40px, -40px) scale(1.15) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95) rotate(240deg);
          }
        }
        .animate-blob1 {
          animation: blob1 20s ease-in-out infinite;
        }
        .animate-blob2 {
          animation: blob2 25s ease-in-out infinite;
        }
        .animate-blob3 {
          animation: blob3 22s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
