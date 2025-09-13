// DashboardUrlForm.tsx (clean rebuild)
"use client";
import { useState, useEffect } from "react";
import { FiLink } from "react-icons/fi";
import { motion } from "framer-motion";
import { buildApiUrl } from "../config/api";
import { getAuthHeaders } from "@/config/api";

interface DashboardUrlFormProps {
  user?: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  onUrlShortened?: (newUrl: {
    shortLink: string;
    originalUrl: string;
    clicks?: number;
    status?: string;
    createdAt?: string;
  }) => void;
  theme?: string;
  onSuccessToast?: (shortLink: string) => void;
  defaultExpiryMinutes?: number;
  quickCopy?: boolean;
}

export default function DashboardUrlForm({
  user,
  onUrlShortened,
  theme = "glass",
  onSuccessToast,
  defaultExpiryMinutes,
  quickCopy = false,
}: DashboardUrlFormProps) {
  const [url, setUrl] = useState("");
  const [autoPaste, setAutoPaste] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const handleFocus = async () => {
      if (autoPaste && url === "") {
        try {
          const clipboardText = await navigator.clipboard.readText();
          if (
            clipboardText &&
            (clipboardText.startsWith("http://") ||
              clipboardText.startsWith("https://"))
          ) {
            setUrl(clipboardText);
          }
        } catch {
          /* ignore */
        }
      }
    };
    if (autoPaste) {
      window.addEventListener("focus", handleFocus);
      return () => window.removeEventListener("focus", handleFocus);
    }
  }, [autoPaste, url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(buildApiUrl("/shorturls"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({
          url: url.trim(),
          ...(defaultExpiryMinutes
            ? { validityMinutes: defaultExpiryMinutes }
            : {}),
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const created = {
          shortLink: data.data.shortLink,
          originalUrl: url.trim(),
          clicks: 0,
          status: "Active",
          createdAt: new Date().toISOString(),
        };
        onUrlShortened?.(created);
        onSuccessToast?.(data.data.shortLink);
        if (quickCopy) {
          try {
            await navigator.clipboard.writeText(data.data.shortLink);
          } catch {}
        }
        // setSuccess("URL shortened successfully!");
        setUrl("");
        setTimeout(() => setSuccess(""), 2500);
      } else {
        setError(data.message || "Failed to shorten URL. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full flex flex-col items-center"
      style={{ maxWidth: "900px" }}
    >
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        className={`flex w-full items-center rounded-full px-4 py-2 shadow-xl border transition-all duration-300 ${
          theme === "light"
            ? "bg-white/90 border-blue-300 shadow-blue-200/50"
            : theme === "dark"
            ? "bg-[#1a1a1a]/90 border-purple-500 shadow-purple-500/25"
            : "bg-[#23263a] border-[#4F8CFF] shadow-[0_0_16px_0_rgba(79,140,255,0.25)]"
        }`}
      >
        <span
          className={`flex items-center pr-2 ${
            theme === "light" ? "text-gray-600" : "text-[#9ca3af]"
          }`}
        >
          <FiLink className="w-5 h-5" />
        </span>
        <input
          type="url"
          placeholder="Enter the link here"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
            setSuccess("");
          }}
          disabled={loading}
          className={`flex-1 bg-transparent outline-none px-2 py-2 text-base disabled:opacity-50 ${
            theme === "light"
              ? "text-gray-900 placeholder-gray-500"
              : "text-white placeholder-[#9ca3af]"
          }`}
        />
        <motion.button
          type="submit"
          disabled={loading || !url.trim()}
          whileHover={
            !loading
              ? {
                  boxShadow:
                    theme === "light" ? "0 0 20px #3B82F6" : "0 0 20px #4F8CFF",
                }
              : {}
          }
          transition={{ type: "tween", duration: 0.18, ease: "easeOut" }}
          className={`ml-2 px-7 py-2 rounded-full font-bold text-white transition text-base disabled:opacity-50 disabled:cursor-not-allowed ${
            theme === "light"
              ? "bg-[#3B82F6] hover:bg-[#2563EB] shadow-[0_0_12px_0_rgba(59,130,246,0.5)]"
              : theme === "dark"
              ? "bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-[0_0_12px_0_rgba(139,92,246,0.5)]"
              : "bg-[#2563eb] hover:bg-[#4F8CFF] shadow-[0_0_12px_0_rgba(37,99,235,0.5)]"
          }`}
        >
          {loading ? "Shortening..." : "Shorten Now!"}
        </motion.button>
      </motion.form>
      <div
        className="flex items-center justify-center gap-2 mt-2 w-full"
        style={{ minHeight: "32px" }}
      >
        <span
          className={`text-sm ${
            theme === "light" ? "text-gray-600" : "text-gray-400"
          }`}
        >
          Auto Paste from Clipboard
        </span>
        <button
          type="button"
          onClick={() => setAutoPaste((v) => !v)}
          className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
            autoPaste
              ? theme === "light"
                ? "bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]"
                : "bg-gradient-to-r from-[#4F8CFF] to-[#E052CB]"
              : theme === "light"
              ? "bg-gray-300 border border-gray-400"
              : "bg-[#23263a] border border-[#35384a]"
          }`}
        >
          <span
            className={`h-4 w-4 rounded-full shadow transform transition-transform duration-300 ${
              autoPaste ? "translate-x-6" : ""
            } bg-white`}
          />
        </button>
        {quickCopy && (
          <span
            className={`text-xs ml-3 ${
              theme === "light" ? "text-blue-600" : "text-[#4F8CFF]"
            }`}
          >
            Auto-copies new short link
          </span>
        )}
      </div>
      {(error || success) && (
        <div className="mt-2 text-xs font-medium">
          {error && (
            <span
              className={theme === "light" ? "text-red-600" : "text-red-400"}
            >
              {error}
            </span>
          )}
          {/* {success && <span className="text-green-400">{success}</span>} */}
        </div>
      )}
    </div>
  );
}
