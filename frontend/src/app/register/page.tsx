"use client";
import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/config/api";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Memoize particle data to prevent re-generation on every keystroke
  const particleData = useMemo(
    () =>
      Array.from({ length: 45 }, (_, i) => ({
        id: i,
        cx: Math.random() * 100,
        cy: Math.random() * 100,
        r: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.7 + 0.3,
        animationDuration: 2 + Math.random() * 3,
        animationDelay: Math.random() * 5,
      })),
    []
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(buildApiUrl("/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("Registration successful! Please log in.");
        setTimeout(() => {
          router.push("/login");
        }, 1000);
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 bg-[#181B23]">
      {/* Animated gradient blobs */}
      <div
        className="absolute w-96 h-96 bg-gradient-to-br from-[#4F8CFF] to-[#E052CB] opacity-30 rounded-full blur-3xl z-0 animate-blob1"
        style={{ top: "-8rem", left: "-8rem" }}
      />
      <div
        className="absolute w-80 h-80 bg-gradient-to-tr from-[#E052CB] to-[#4F8CFF] opacity-20 rounded-full blur-3xl z-0 animate-blob2"
        style={{ bottom: "-6rem", right: "-6rem" }}
      />
      <div
        className="absolute w-72 h-72 bg-gradient-to-tl from-[#4F8CFF] to-[#E052CB] opacity-20 rounded-full blur-2xl z-0 animate-blob3"
        style={{ top: "60%", left: "60%" }}
      />
      {/* Starfield background with SVG moon illustration in top right */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Gradient and stars SVG */}
        <svg
          width="100%"
          height="100%"
          className="absolute inset-0"
          style={{ minHeight: "100vh" }}
        >
          <defs>
            <radialGradient id="aurora" cx="50%" cy="100%" r="80%">
              <stop offset="0%" stopColor="#4F8CFF" stopOpacity="0.25">
                <animate
                  attributeName="stop-color"
                  values="#4F8CFF;#E052CB;#4F8CFF"
                  dur="8s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#E052CB" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#aurora)" />
          {/* Optimized stars with memoized data */}
          {particleData.map((particle) => (
            <circle
              key={particle.id}
              cx={`${particle.cx}%`}
              cy={`${particle.cy}%`}
              r={particle.r}
              fill="#fff"
              opacity={particle.opacity}
              style={{
                animation: `twinkle ${particle.animationDuration}s infinite alternate`,
                animationDelay: `${particle.animationDelay}s`,
              }}
            />
          ))}
          {/* Cute SVG moon illustration in top right, glowing, no grey oval */}
          <g>
            {/* Moon glow */}
            <defs>
              <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f6faff" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#f6faff" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="moonSurfaceGrad" cx="60%" cy="40%" r="70%">
                <stop offset="0%" stopColor="#fff" />
                <stop offset="70%" stopColor="#e6eaf2" />
                <stop offset="100%" stopColor="#dbeafe" />
              </radialGradient>
            </defs>
            <g transform="translate(1420,90)">
              {/* Outer glow */}
              <circle
                cx="0"
                cy="0"
                r="85"
                fill="url(#moonGlow)"
                opacity="0.7"
              />
              {/* Main moon with gradient */}
              <circle
                cx="0"
                cy="0"
                r="70"
                fill="url(#moonSurfaceGrad)"
                stroke="#23263a"
                strokeWidth="6"
              />
              {/* Craters */}
              <circle cx="-25" cy="-20" r="13" fill="#dbeafe" opacity="0.5" />
              <circle cx="20" cy="10" r="7" fill="#dbeafe" opacity="0.4" />
              <circle cx="30" cy="-15" r="5" fill="#dbeafe" opacity="0.3" />
              {/* Eyes (arc, matching screenshot) */}
              <path
                d="M -32 10 Q -20 22 -8 10"
                stroke="#23263a"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 8 10 Q 20 22 32 10"
                stroke="#23263a"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              />
              {/* Mouth (circle, matching screenshot) */}
              <circle cx="0" cy="28" r="10" fill="#23263a" />
              {/* Zzz - infinite, moving, fading, random, big to small, realistic */}
              {[
                { x: 50, y: -35, size: 28, delay: 0, opacity: 0.7, dur: 2.5 },
                { x: 65, y: -55, size: 22, delay: 0.7, opacity: 0.5, dur: 2.7 },
                {
                  x: 80,
                  y: -75,
                  size: 16,
                  delay: 1.3,
                  opacity: 0.35,
                  dur: 2.2,
                },
                {
                  x: 90,
                  y: -95,
                  size: 12,
                  delay: 1.9,
                  opacity: 0.22,
                  dur: 2.9,
                },
                {
                  x: 100,
                  y: -115,
                  size: 9,
                  delay: 2.5,
                  opacity: 0.13,
                  dur: 2.1,
                },
              ].map((z, idx) => (
                <text
                  key={idx}
                  x={z.x}
                  y={z.y}
                  fontSize={z.size}
                  fill="#f6faff"
                  opacity={z.opacity}
                  fontFamily="monospace"
                  className="zzz-anim"
                  style={{
                    animationDelay: `${z.delay}s`,
                    animationDuration: `${z.dur}s`,
                  }}
                >
                  Z
                </text>
              ))}
            </g>
          </g>
        </svg>
      </div>
      {/* Card with glow and hover effect */}
      <div className="relative z-10 bg-[#23263a]/95 rounded-2xl shadow-[0_0_32px_0_rgba(79,140,255,0.18)] border border-[#4F8CFF] p-10 max-w-md w-full mx-auto flex flex-col gap-6 transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_64px_0_rgba(79,140,255,0.35)]">
        <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#4F8CFF] to-[#E052CB] mb-2 tracking-tight">
          Create an Account
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            className="bg-[#181B23] border border-[#35384a] rounded-lg px-5 py-3 text-white placeholder-[#9ca3af] focus:outline-none focus:border-[#4F8CFF] transition text-base"
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
          />
          <input
            className="bg-[#181B23] border border-[#35384a] rounded-lg px-5 py-3 text-white placeholder-[#9ca3af] focus:outline-none focus:border-[#4F8CFF] transition text-base"
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
          <input
            className="bg-[#181B23] border border-[#35384a] rounded-lg px-5 py-3 text-white placeholder-[#9ca3af] focus:outline-none focus:border-[#4F8CFF] transition text-base"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
          <input
            className="bg-[#181B23] border border-[#35384a] rounded-lg px-5 py-3 text-white placeholder-[#9ca3af] focus:outline-none focus:border-[#4F8CFF] transition text-base"
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}
          {success && (
            <div className="text-green-400 text-sm text-center">{success}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-[#4F8CFF] to-[#E052CB] text-white font-bold py-3 rounded-lg shadow-lg hover:opacity-90 transition text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>
        <div className="text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-[#4F8CFF] underline hover:text-[#E052CB] transition"
          >
            Login
          </a>
        </div>
      </div>
      <style jsx global>{`
        @keyframes twinkle {
          from {
            opacity: 0.3;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes blob1 {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(40px) scale(1.08);
          }
        }
        @keyframes blob2 {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-30px) scale(1.05);
          }
        }
        @keyframes blob3 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-30px, 30px) scale(1.1);
          }
        }
        .animate-blob1 {
          animation: blob1 12s ease-in-out infinite;
        }
        .animate-blob2 {
          animation: blob2 14s ease-in-out infinite;
        }
        .animate-blob3 {
          animation: blob3 16s ease-in-out infinite;
        }
        /* Zzz floating animation */
        .zzz1,
        .zzz2 {
          animation: zzz-float 2.5s linear infinite;
        }
        .zzz2 {
          animation-delay: 0.7s;
        }
        .zzz-anim {
          animation-name: zzz-float-fade;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes zzz-float-fade {
          0% {
            opacity: 0;
            transform: translateY(0);
          }
          10% {
            opacity: 1;
          }
          60% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-60px);
          }
        }
      `}</style>
    </div>
  );
}
