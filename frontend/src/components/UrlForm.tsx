// components/UrlForm.tsx
"use client";
import { useState, useEffect } from "react";
import { FiLink } from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "../config/api";

interface UrlFormProps {
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
  /**
   * When true, submitting the form will redirect to /register instead of calling the API.
   * Use this on the public home page.
   */
  redirectToRegisterOnSubmit?: boolean;
}

export default function UrlForm({
  user,
  onUrlShortened,
  redirectToRegisterOnSubmit = false,
}: UrlFormProps) {
  const [url, setUrl] = useState("");
  const [autoPaste, setAutoPaste] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // Auto-paste from clipboard functionality
  useEffect(() => {
    const handleFocus = async () => {
      if (autoPaste && url === "") {
        try {
          const clipboardText = await navigator.clipboard.readText();
          // Check if clipboard contains a URL
          if (
            clipboardText &&
            (clipboardText.startsWith("http://") ||
              clipboardText.startsWith("https://"))
          ) {
            setUrl(clipboardText);
          }
        } catch (error) {
          // Clipboard access denied or not available
          console.log("Clipboard access not available");
        }
      }
    };

    // Listen for window focus to check clipboard
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

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    // On public home, redirect to register instead of shortening
    if (redirectToRegisterOnSubmit && !user) {
      router.push("/register");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(buildApiUrl("/shorturls"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          url: url.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("URL shortened successfully!");
        setUrl(""); // Clear the input

        // Call the callback to update the table
        if (onUrlShortened) {
          onUrlShortened({
            shortLink: data.data.shortLink,
            originalUrl: url.trim(),
            clicks: 0,
            status: "Active",
            createdAt: new Date().toISOString(),
          });
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to shorten URL. Please try again.");
      }
    } catch (error) {
      console.error("URL shortening error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center mt-2">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        className="flex w-full items-center bg-[#23263a] border border-[#4F8CFF] rounded-full px-4 py-2 shadow-[0_0_16px_0_rgba(79,140,255,0.25)] mb-3"
      >
        <span className="flex items-center pr-2 text-[#9ca3af]">
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
          className="flex-1 bg-transparent outline-none px-2 py-2 text-white placeholder-[#9ca3af] text-base disabled:opacity-50"
        />
        <motion.button
          type="submit"
          disabled={loading || !url.trim()}
          whileHover={!loading ? { boxShadow: "0 0 20px #4F8CFF" } : {}}
          transition={{
            type: "tween",
            duration: 0.18,
            ease: "easeOut",
          }}
          className="ml-2 px-7 py-2 rounded-full font-bold text-white bg-[#2563eb] hover:bg-[#4F8CFF] shadow-[0_0_8px_0_rgba(79,140,255,0.5)] transition text-base disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ boxShadow: "0 0 12px 0 #2563eb80" }}
        >
          {loading ? "Shortening..." : "Shorten Now!"}
        </motion.button>
      </motion.form>

      {/* Error/Success Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm mb-2"
        >
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-green-400 text-sm mb-2"
        >
          {success}
        </motion.div>
      )}

      <motion.div
        className="flex items-center justify-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        <span className="text-gray-400 text-sm">Auto Paste from Clipboard</span>
        <button
          type="button"
          onClick={() => setAutoPaste((v) => !v)}
          className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
            autoPaste
              ? "bg-gradient-to-r from-[#4F8CFF] to-[#E052CB]"
              : "bg-[#23263a] border border-[#35384a]"
          }`}
        >
          <span
            className={`h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-300 ${
              autoPaste ? "translate-x-6" : ""
            }`}
          />
        </button>
      </motion.div>
    </div>
  );
}
