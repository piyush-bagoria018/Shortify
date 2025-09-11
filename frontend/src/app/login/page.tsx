"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/config/api";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(buildApiUrl("/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Cookies set by server; just redirect
        router.push("/dashboard");
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Enhanced layered background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f1419] via-[#1a1d29] to-[#2d1b3d] z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#4a2c5c]/40 via-transparent to-transparent z-0" />

      {/* Enhanced animated gradient blobs */}
      <div
        className="absolute w-[500px] h-[500px] bg-gradient-to-br from-[#ff6b6b]/30 via-[#feca57]/20 to-[#ff9ff3]/10 rounded-full blur-3xl z-0 animate-blob1"
        style={{ top: "-12rem", right: "-12rem" }}
      />
      <div
        className="absolute w-[400px] h-[400px] bg-gradient-to-tr from-[#feca57]/25 via-[#ff9ff3]/15 to-[#54a0ff]/10 rounded-full blur-3xl z-0 animate-blob2"
        style={{ bottom: "-10rem", left: "-10rem" }}
      />
      <div
        className="absolute w-[350px] h-[350px] bg-gradient-to-tl from-[#ff9ff3]/20 via-[#54a0ff]/15 to-[#feca57]/10 rounded-full blur-2xl z-0 animate-blob3"
        style={{ top: "40%", left: "60%" }}
      />

      {/* Enhanced atmospheric effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg
          width="100%"
          height="100%"
          className="absolute inset-0"
          style={{ minHeight: "100vh" }}
        >
          <defs>
            <radialGradient id="dawnGlow" cx="80%" cy="20%" r="50%">
              <stop offset="0%" stopColor="#feca57" stopOpacity="0.4">
                <animate
                  attributeName="stop-color"
                  values="#feca57;#ff6b6b;#ff9ff3;#54a0ff;#feca57"
                  dur="12s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor="#ff6b6b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ff9ff3" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="horizon" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4a2c5c" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#feca57" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#dawnGlow)" />
          {/* <rect x="0" y="60%" width="100%" height="40%" fill="url(#horizon)" /> */}

          {/* Enhanced floating particles with different sizes */}
          {[...Array(60)].map((_, i) => (
            <circle
              key={i}
              cx={Math.random() * 100 + "%"}
              cy={Math.random() * 100 + "%"}
              r={Math.random() * 3 + 0.3}
              fill={
                i % 3 === 0 ? "#feca57" : i % 3 === 1 ? "#ff6b6b" : "#ff9ff3"
              }
              opacity={Math.random() * 0.6 + 0.2}
              style={{
                animation: `float ${
                  2 + Math.random() * 6
                }s infinite ease-in-out`,
                animationDelay: `${Math.random() * 8}s`,
              }}
            />
          ))}

          {/* Premium sun illustration with multiple layers */}
          <g transform="translate(1280,140)">
            <defs>
              <radialGradient id="sunCore" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
                <stop offset="30%" stopColor="#feca57" />
                <stop offset="70%" stopColor="#ff6b6b" />
                <stop offset="100%" stopColor="#ff9ff3" />
              </radialGradient>
              <radialGradient id="sunHalo" cx="50%" cy="50%" r="80%">
                <stop offset="0%" stopColor="#feca57" stopOpacity="0" />
                <stop offset="60%" stopColor="#feca57" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Multiple glow layers */}
            <circle cx="0" cy="0" r="120" fill="url(#sunHalo)" />
            <circle cx="0" cy="0" r="90" fill="#feca57" opacity="0.08" />
            <circle cx="0" cy="0" r="70" fill="#feca57" opacity="0.12" />
            <circle cx="0" cy="0" r="50" fill="#feca57" opacity="0.15" />

            {/* Main sun with animated core */}
            <circle cx="0" cy="0" r="35" fill="url(#sunCore)" opacity="0.9">
              <animate
                attributeName="r"
                values="35;38;35"
                dur="4s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Dynamic rays with different lengths */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
              (angle, i) => (
                <g key={i}>
                  <line
                    x1={Math.cos((angle * Math.PI) / 180) * 45}
                    y1={Math.sin((angle * Math.PI) / 180) * 45}
                    x2={Math.cos((angle * Math.PI) / 180) * (70 + (i % 3) * 10)}
                    y2={Math.sin((angle * Math.PI) / 180) * (70 + (i % 3) * 10)}
                    stroke="#feca57"
                    strokeWidth={i % 2 === 0 ? "4" : "2"}
                    opacity="0.7"
                    strokeLinecap="round"
                    transform={`rotate(${angle} 0 0)`}
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      values={`${angle} 0 0;${angle + 10} 0 0;${angle} 0 0`}
                      dur="8s"
                      repeatCount="indefinite"
                    />
                  </line>
                </g>
              )
            )}

            {/* Subtle sparkle effects */}
            {[...Array(8)].map((_, i) => (
              <circle
                key={`sparkle-${i}`}
                cx={
                  Math.cos((i * 45 * Math.PI) / 180) * (80 + Math.random() * 20)
                }
                cy={
                  Math.sin((i * 45 * Math.PI) / 180) * (80 + Math.random() * 20)
                }
                r="2"
                fill="#fff"
                opacity="0.8"
              >
                <animate
                  attributeName="opacity"
                  values="0.8;0.2;0.8"
                  dur={`${2 + Math.random() * 3}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </g>
        </svg>
      </div>

      {/* Enhanced Login Card with better dark theme */}
      <div className="relative z-10 bg-[#23263a]/95 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_0_rgba(254,202,87,0.15)] border border-[#feca57]/30 p-8 max-w-md w-full mx-auto flex flex-col gap-5 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_60px_0_rgba(254,202,87,0.25)] hover:border-[#feca57]/50">
        {/* Enhanced header with subtitle */}
        <div className="text-center mb-2">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#feca57] via-[#ff6b6b] to-[#ff9ff3] mb-2 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-[#9ca3af] text-sm font-medium">
            Sign in to continue your journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Dark themed input fields */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#f59e42]">
              <svg
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <input
              className="w-full bg-[#1a1d29] border border-[#35384a] rounded-lg pl-11 pr-4 py-3 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#feca57] focus:ring-1 focus:ring-[#feca57]/30 transition-all text-sm"
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#f59e42]">
              <svg
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              className="w-full bg-[#1a1d29] border border-[#35384a] rounded-lg pl-11 pr-4 py-3 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#feca57] focus:ring-1 focus:ring-[#feca57]/30 transition-all text-sm"
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2 px-3 border border-red-500/20">
              {error}
            </div>
          )}

          {/* Improved button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 bg-gradient-to-r from-[#feca57] via-[#ff6b6b] to-[#ff9ff3] text-white font-semibold py-3 rounded-lg shadow-[0_4px_20px_0_rgba(254,202,87,0.4)] hover:shadow-[0_6px_30px_0_rgba(254,202,87,0.5)] transition-all duration-300 text-base tracking-wide relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">
              {loading ? "Signing In..." : "Sign In"}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b6b] via-[#ff9ff3] to-[#feca57] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </form>

        {/* Forgot Password Link */}
        <div className="text-center text-gray-400 text-sm pt-2">
          <a
            href="/forgot-password"
            className="text-transparent bg-clip-text bg-gradient-to-r from-[#feca57] to-[#ff6b6b] font-medium underline hover:from-[#ff6b6b] hover:to-[#ff9ff3] transition-all duration-300"
          >
            Forgot your password?
          </a>
        </div>

        {/* Enhanced footer */}
        <div className="text-center text-gray-400 text-sm pt-3">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-transparent bg-clip-text bg-gradient-to-r from-[#feca57] to-[#ff6b6b] font-medium underline hover:from-[#ff6b6b] hover:to-[#ff9ff3] transition-all duration-300"
          >
            Create Account
          </a>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          25% {
            transform: translateY(-30px) translateX(15px) scale(1.1);
          }
          50% {
            transform: translateY(-10px) translateX(-20px) scale(0.9);
          }
          75% {
            transform: translateY(20px) translateX(10px) scale(1.05);
          }
        }
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
