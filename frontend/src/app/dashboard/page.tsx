"use client";

import DashboardTabs from "../../components/DashboardTabs";
import DashboardUrlForm from "../../components/DashboardUrlForm";
import UrlHistoryTable from "../../components/UrlHistoryTable";
import { useEffect, useState, useRef } from "react";
import { buildApiUrl } from "@/config/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSettings,
  FiBell,
  FiUser,
  FiLogOut,
  FiBarChart2,
  FiTrendingUp,
  FiLink,
  FiShield,
  FiChevronDown,
  FiSun,
  FiX,
  FiMoon,
} from "react-icons/fi";

// Get dynamic glow color based on avatar type
const getAvatarGlow = (avatar: string) => {
  if (["🚀", "⚡", "🔥"].includes(avatar))
    return "shadow-orange-500/50 ring-orange-400/30";
  if (["🎨", "🎮", "🎵"].includes(avatar))
    return "shadow-purple-500/50 ring-purple-400/30";
  if (["💎", "🌟", "⭐"].includes(avatar))
    return "shadow-yellow-500/50 ring-yellow-400/30";
  if (["🎯", "🎪", "🎭"].includes(avatar))
    return "shadow-pink-500/50 ring-pink-400/30";
  if (["🌈", "🌙", "☀️"].includes(avatar))
    return "shadow-blue-500/50 ring-blue-400/30";
  if (["🌊", "🌸", "🍃"].includes(avatar))
    return "shadow-green-500/50 ring-green-400/30";
  if (["🌺", "🦄", "🐉"].includes(avatar))
    return "shadow-cyan-500/50 ring-cyan-400/30";
  if (["🦋", "🦊", "🐺"].includes(avatar))
    return "shadow-red-500/50 ring-red-400/30";
  return "shadow-indigo-500/50 ring-indigo-400/30"; // default
};

const featureTabs = [
  { id: "History", label: "History", icon: FiBarChart2 },
  { id: "Statistics", label: "Statistics", icon: FiTrendingUp },
  { id: "Click Stream", label: "Click Stream", icon: FiLink },
  { id: "Settings", label: "Settings", icon: FiSettings },
];

// Modern predefined avatars (Discord-style)
const predefinedAvatars = [
  "🚀",
  "🎨",
  "🎮",
  "🎵",
  "⚡",
  "🔥",
  "💎",
  "🌟",
  "🎯",
  "🎪",
  "🎭",
  "🎨",
  "🎸",
  "🎺",
  "🎷",
  "🎤",
  "🌈",
  "🌙",
  "☀️",
  "⭐",
  "🌊",
  "🌸",
  "🍃",
  "🌺",
  "🦄",
  "🐉",
  "🦋",
  "🦊",
  "🐺",
  "🦁",
  "🐯",
  "🐱",
];

// Theme options
const themes = [
  {
    id: "glass",
    label: "Glassmorphism",
    icon: <FiSun className="w-5 h-5 text-blue-400" />,
    bg: "bg-gradient-to-br from-[#0a0a13] via-[#181b23] to-[#0f1117]",
    description: "Glass effects with blur",
  },
  {
    id: "dark",
    label: "Dark Pro",
    icon: <FiMoon className="w-5 h-5 text-purple-400" />,
    bg: "bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#2d2d2d]",
    description: "Pure dark theme",
  },
  {
    id: "light",
    label: "Light Mode",
    icon: <FiSun className="w-5 h-5 text-orange-400" />,
    bg: "bg-gradient-to-br from-[#ffffff] via-[#f8fafc] to-[#e2e8f0]",
    description: "Clean light theme",
  },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("History");
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    avatar: string;
    selectedAvatar?: number;
    bio?: string;
    location?: string;
    website?: string;
    dateOfBirth?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState<{
    shortLink: string;
    originalUrl: string;
    clicks?: number;
    status?: string;
    createdAt?: string;
    expiry?: string;
  } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);

  // Theme state
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "glass";
    }
    return "glass";
  });
  const [profileFormData, setProfileFormData] = useState({
    username: "",
    email: "",
    selectedAvatar: 0, // Index of selected predefined avatar
    bio: "",
    location: "",
    website: "",
    dateOfBirth: "",
  });
  const [accountFormData, setAccountFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [toasts, setToasts] = useState<
    Array<{
      id: number;
      message: string;
      type: "success" | "error" | "info" | "new";
    }>
  >([]);
  const [notifications] = useState([
    {
      id: 1,
      message:
        "Welcome to Shortify! Your account is active with unlimited URLs.",
      type: "success",
    },
    {
      id: 2,
      message: "Portfolio Demo: Create unlimited short links!",
      type: "info",
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Minimal preferences (local only)
  const [defaultExpiryMinutes, setDefaultExpiryMinutes] = useState<number>(
    () => {
      if (typeof window !== "undefined") {
        const v = localStorage.getItem("pref.defaultExpiry");
        return v ? parseInt(v) : 30;
      }
      return 30;
    }
  );
  const [quickCopy, setQuickCopy] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pref.quickCopy") === "true";
    }
    return false;
  });

  const updateDefaultExpiry = (val: number) => {
    setDefaultExpiryMinutes(val);
    try {
      localStorage.setItem("pref.defaultExpiry", String(val));
    } catch {}
    showToast(`Default expiry set to ${val} min`, "success");
  };
  const toggleQuickCopy = () => {
    const next = !quickCopy; // derive next state outside updater to avoid duplicate side-effects in StrictMode
    setQuickCopy(next);
    try {
      localStorage.setItem("pref.quickCopy", String(next));
    } catch {}
    showToast(next ? "Quick Copy enabled" : "Quick Copy disabled", "info");
  };

  const handleUrlShortened = (shortenedUrl: {
    shortLink: string;
    originalUrl: string;
    clicks?: number;
    status?: string;
    createdAt?: string;
  }) => {
    setNewUrl(shortenedUrl);
  };

  const handleLogout = async () => {
    try {
      await fetch(buildApiUrl("/auth/logout"), {
        method: "POST",
        credentials: "include",
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleOpenProfileModal = () => {
    setProfileFormData({
      username: user?.name || "",
      email: user?.email || "",
      selectedAvatar: user?.selectedAvatar || 0,
      bio: user?.bio || "",
      location: user?.location || "",
      website: user?.website || "",
      dateOfBirth: user?.dateOfBirth || "",
    });
    setShowProfileModal(true);
    setShowDropdown(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!profileFormData.username.trim()) {
      showToast("Username is required", "error");
      return;
    }

    if (!profileFormData.email.trim()) {
      showToast("Email is required", "error");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileFormData.email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    setProfileLoading(true);
    try {
      const res = await fetch(buildApiUrl("/auth/profile"), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: profileFormData.username,
          email: profileFormData.email,
          selectedAvatar: profileFormData.selectedAvatar,
          bio: profileFormData.bio,
          location: profileFormData.location,
          website: profileFormData.website,
          dateOfBirth: profileFormData.dateOfBirth,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setShowProfileModal(false);
        // Reset form
        setProfileFormData({
          username: "",
          email: "",
          selectedAvatar: 0,
          bio: "",
          location: "",
          website: "",
          dateOfBirth: "",
        });
        showToast("Profile updated successfully!", "success");
      } else {
        const errorData = await res.json();
        showToast(errorData.message || "Failed to update profile", "error");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      showToast("Network error occurred", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  // Toast notification functions
  // Stable incremental id to prevent duplicate key warnings (Date.now can collide in fast successive calls / StrictMode replays)
  const toastIdRef = useRef(0);
  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "new" = "info"
  ) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Avatar handling functions
  const handleAvatarSelect = (avatarIndex: number) => {
    setProfileFormData({ ...profileFormData, selectedAvatar: avatarIndex });
  };

  // Account Settings handlers
  const handleOpenAccountModal = () => {
    setAccountFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowAccountModal(true);
    setShowDropdown(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (!accountFormData.currentPassword) {
      showToast("Please enter your current password", "error");
      return;
    }

    if (
      !accountFormData.newPassword ||
      accountFormData.newPassword.length < 6
    ) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }

    if (accountFormData.newPassword !== accountFormData.confirmPassword) {
      showToast("New passwords don&apos;t match", "error");
      return;
    }

    setAccountLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(buildApiUrl("/auth/change-password"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: accountFormData.currentPassword,
          newPassword: accountFormData.newPassword,
        }),
      });

      if (res.ok) {
        setShowAccountModal(false);
        setAccountFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        showToast("Password changed successfully!", "success");
      } else {
        const errorData = await res.json();
        showToast(errorData.message || "Failed to change password", "error");
      }
    } catch (error) {
      console.error("Password change failed:", error);
      showToast("Network error occurred", "error");
    } finally {
      setAccountLoading(false);
    }
  };

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { level: 0, text: "", color: "" };
    if (password.length < 6)
      return { level: 1, text: "Weak", color: "text-red-400" };
    if (password.length < 8)
      return { level: 2, text: "Fair", color: "text-yellow-400" };
    if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    ) {
      return { level: 4, text: "Strong", color: "text-green-400" };
    }
    return { level: 3, text: "Good", color: "text-blue-400" };
  };

  // Theme effect
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.classList.remove(
        "theme-glass",
        "theme-dark",
        "theme-light"
      );
      document.body.classList.add(`theme-${theme}`);
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(buildApiUrl("/auth/me"), {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data?.data?.user);
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.classList.remove(
        "theme-glass",
        "theme-dark",
        "theme-light"
      );
      document.body.classList.add(`theme-${theme}`);
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/80">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="h-screen relative flex flex-col overflow-hidden">
      {/* DRAMATIC Animated Background with Floating Elements */}
      <div
        className={`absolute inset-0 overflow-hidden transition-all duration-500 ${
          theme === "light"
            ? "bg-gradient-to-br from-[#ffffff] via-[#f8fafc] to-[#e2e8f0]"
            : theme === "dark"
            ? "bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#2d2d2d]"
            : "bg-gradient-to-br from-[#0a0a13] via-[#181b23] to-[#0f1117]"
        }`}
      >
        {/* Enhanced Theme-specific overlay with STRONG animation */}
        {theme === "glass" && (
          <>
            <div className="absolute inset-0 bg-[url('/moon-bg.png')] bg-cover bg-center opacity-30" />
            <motion.div
              className="absolute inset-0 backdrop-blur-[100px]"
              animate={{
                backdropFilter: ["blur(100px)", "blur(120px)", "blur(100px)"],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}
        {theme === "dark" && (
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "linear-gradient(135deg, rgba(88, 28, 135, 0.2) 0%, rgba(30, 64, 175, 0.1) 50%, rgba(168, 85, 247, 0.15) 100%)",
                "linear-gradient(135deg, rgba(30, 64, 175, 0.15) 0%, rgba(168, 85, 247, 0.2) 50%, rgba(88, 28, 135, 0.1) 100%)",
                "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(88, 28, 135, 0.15) 50%, rgba(30, 64, 175, 0.1) 100%)",
                "linear-gradient(135deg, rgba(88, 28, 135, 0.2) 0%, rgba(30, 64, 175, 0.1) 50%, rgba(168, 85, 247, 0.15) 100%)",
              ],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {theme === "light" && (
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "linear-gradient(135deg, rgba(79, 140, 255, 0.1) 0%, rgba(224, 82, 203, 0.08) 50%, rgba(59, 130, 246, 0.12) 100%)",
                "linear-gradient(135deg, rgba(224, 82, 203, 0.12) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(79, 140, 255, 0.08) 100%)",
                "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(79, 140, 255, 0.12) 50%, rgba(224, 82, 203, 0.08) 100%)",
                "linear-gradient(135deg, rgba(79, 140, 255, 0.1) 0%, rgba(224, 82, 203, 0.08) 50%, rgba(59, 130, 246, 0.12) 100%)",
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* MASSIVE Primary Floating Elements - Much More Dramatic */}
        <motion.div
          className={`absolute top-[-50px] left-[-50px] w-80 h-80 rounded-full ${
            theme === "light"
              ? "bg-gradient-to-br from-[#4F8CFF]/30 via-[#8B5CF6]/25 to-[#E052CB]/30 shadow-2xl"
              : theme === "dark"
              ? "bg-gradient-to-br from-[#8B5CF6]/25 via-[#06B6D4]/20 to-[#EC4899]/25 shadow-2xl shadow-purple-500/20"
              : "bg-gradient-to-br from-[#4F8CFF]/28 via-[#E052CB]/23 to-[#8B5CF6]/28 shadow-2xl shadow-blue-500/20"
          }`}
          style={{
            filter: "blur(60px)",
          }}
          animate={{
            x: [0, 100, 50, 0],
            y: [0, -60, -30, 0],
            scale: [1, 1.4, 1.2, 1],
            opacity: [0.7, 1, 0.8, 0.7],
            rotate: [0, 90, 45, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className={`absolute top-20 right-[-100px] w-96 h-96 rounded-full ${
            theme === "light"
              ? "bg-gradient-to-bl from-[#F59E0B]/25 via-[#EF4444]/20 to-[#EC4899]/25 shadow-2xl"
              : theme === "dark"
              ? "bg-gradient-to-bl from-[#EC4899]/20 via-[#8B5CF6]/15 to-[#06B6D4]/20 shadow-2xl shadow-pink-500/20"
              : "bg-gradient-to-bl from-[#E052CB]/23 via-[#4F8CFF]/18 to-[#F59E0B]/23 shadow-2xl shadow-orange-500/20"
          }`}
          style={{
            filter: "blur(70px)",
          }}
          animate={{
            x: [0, -80, -40, 0],
            y: [0, 80, 40, 0],
            scale: [1, 1.3, 1.1, 1],
            rotate: [0, -120, -60, 0],
            opacity: [0.6, 0.9, 0.7, 0.6],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className={`absolute bottom-[-80px] left-1/4 w-[500px] h-[500px] rounded-full ${
            theme === "light"
              ? "bg-gradient-to-tr from-[#10B981]/20 via-[#3B82F6]/15 to-[#8B5CF6]/20 shadow-2xl"
              : theme === "dark"
              ? "bg-gradient-to-tr from-[#06B6D4]/15 via-[#8B5CF6]/12 to-[#EC4899]/15 shadow-2xl shadow-cyan-500/20"
              : "bg-gradient-to-tr from-[#4F8CFF]/18 via-[#10B981]/13 to-[#E052CB]/18 shadow-2xl shadow-green-500/20"
          }`}
          style={{
            filter: "blur(80px)",
          }}
          animate={{
            x: [0, 120, 60, 0],
            y: [0, -100, -50, 0],
            scale: [1, 1.5, 1.3, 1],
            opacity: [0.5, 0.8, 0.6, 0.5],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className={`absolute bottom-10 right-[-60px] w-72 h-72 rounded-full ${
            theme === "light"
              ? "bg-gradient-to-tl from-[#E052CB]/35 via-[#4F8CFF]/30 to-[#8B5CF6]/35 shadow-2xl"
              : "bg-gradient-to-tl from-[#E052CB]/30 via-[#4F8CFF]/25 to-[#06B6D4]/30 shadow-2xl shadow-blue-500/20"
          }`}
          style={{
            filter: "blur(50px)",
          }}
          animate={{
            x: [0, -100, -50, 0],
            y: [0, 60, 30, 0],
            scale: [1, 1.4, 1.2, 1],
            rotate: [0, 180, 90, 0],
            opacity: [0.8, 1, 0.9, 0.8],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className={`absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full ${
            theme === "light"
              ? "bg-gradient-to-br from-[#4F8CFF]/25 via-[#E052CB]/20 to-[#EC4899]/25 shadow-2xl"
              : "bg-gradient-to-br from-[#4F8CFF]/20 via-[#E052CB]/15 to-[#8B5CF6]/20 shadow-2xl shadow-purple-500/20"
          }`}
          style={{
            filter: "blur(90px)",
          }}
          animate={{
            x: [0, 150, 75, 0],
            y: [0, -120, -60, 0],
            scale: [1, 1.2, 1.1, 1],
            opacity: [0.4, 0.7, 0.5, 0.4],
            rotate: [0, -90, -45, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* MEDIUM Floating Elements - More Visible */}
        <motion.div
          className={`absolute top-1/3 left-1/2 w-48 h-48 rounded-full ${
            theme === "light"
              ? "bg-gradient-to-r from-[#8B5CF6]/40 via-[#EC4899]/35 to-[#F59E0B]/40 shadow-xl"
              : theme === "dark"
              ? "bg-gradient-to-r from-[#F59E0B]/35 via-[#EF4444]/30 to-[#EC4899]/35 shadow-xl shadow-orange-500/20"
              : "bg-gradient-to-r from-[#06B6D4]/35 via-[#8B5CF6]/30 to-[#E052CB]/35 shadow-xl shadow-cyan-500/20"
          }`}
          style={{
            filter: "blur(30px)",
          }}
          animate={{
            x: [0, -60, 30, 0],
            y: [0, 80, -40, 0],
            scale: [1, 1.6, 0.9, 1],
            rotate: [0, 180, 360, 540],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className={`absolute bottom-1/4 left-1/6 w-56 h-56 rounded-full ${
            theme === "light"
              ? "bg-gradient-to-bl from-[#06B6D4]/35 via-[#10B981]/30 to-[#3B82F6]/35 shadow-xl"
              : theme === "dark"
              ? "bg-gradient-to-bl from-[#4F8CFF]/30 via-[#E052CB]/25 to-[#8B5CF6]/30 shadow-xl shadow-blue-500/20"
              : "bg-gradient-to-bl from-[#EC4899]/30 via-[#8B5CF6]/25 to-[#4F8CFF]/30 shadow-xl shadow-pink-500/20"
          }`}
          style={{
            filter: "blur(40px)",
          }}
          animate={{
            x: [0, 90, -45, 0],
            y: [0, -70, 35, 0],
            rotate: [0, 240, 480, 720],
            scale: [1, 1.3, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* SUPER Visible Particles - Like Floating Stars */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-4 h-4 rounded-full ${
              theme === "light"
                ? i % 3 === 0
                  ? "bg-[#4F8CFF]/70 shadow-lg shadow-blue-400/50"
                  : i % 3 === 1
                  ? "bg-[#E052CB]/70 shadow-lg shadow-pink-400/50"
                  : "bg-[#8B5CF6]/70 shadow-lg shadow-purple-400/50"
                : theme === "dark"
                ? i % 3 === 0
                  ? "bg-[#E052CB]/80 shadow-lg shadow-pink-500/60"
                  : i % 3 === 1
                  ? "bg-[#4F8CFF]/80 shadow-lg shadow-blue-500/60"
                  : "bg-[#06B6D4]/80 shadow-lg shadow-cyan-500/60"
                : i % 3 === 0
                ? "bg-[#4F8CFF]/75 shadow-lg shadow-blue-400/55"
                : i % 3 === 1
                ? "bg-[#E052CB]/75 shadow-lg shadow-pink-400/55"
                : "bg-[#8B5CF6]/75 shadow-lg shadow-purple-400/55"
            }`}
            style={{
              left: `${10 + ((i * 8) % 80)}%`,
              top: `${10 + ((i * 12) % 80)}%`,
              filter: "blur(1px)",
            }}
            animate={{
              y: [0, -200, 50, -150, 0],
              x: [0, 30, -20, 40, 0],
              opacity: [0, 1, 0.7, 1, 0],
              scale: [0, 2, 1, 1.5, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* DRAMATIC Grid Pattern */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(79, 140, 255, 0.6) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
          animate={{
            opacity: [0.05, 0.15, 0.05],
            backgroundPosition: ["0px 0px", "25px 25px", "0px 0px"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* MINIMAL Overlay - Don&apos;t hide the beauty */}
        <motion.div
          className={`absolute inset-0 ${
            theme === "light"
              ? "bg-gradient-to-b from-transparent to-white/5"
              : "bg-gradient-to-b from-transparent to-[#181b23]/15"
          }`}
          animate={{
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Top bar: Logo, UrlForm, User Dropdown (match Figma exactly) */}
      <header
        className={`sticky top-0 z-50 w-full flex items-start justify-between py-4 px-6 backdrop-blur-md border-b transition-all duration-300 ${
          theme === "light"
            ? "bg-white/80 border-gray-200/50"
            : theme === "dark"
            ? "bg-[#0f0f0f]/80 border-gray-800/50"
            : "bg-[#181B23]/80 border-[#23263A]/50"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center pt-2">
          <span
            className={`text-2xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent select-none ${
              theme === "light"
                ? "from-[#E052CB] to-[#4F8CFF]"
                : "from-[#E052CB] to-[#4F8CFF]"
            }`}
          >
            Shortify
          </span>
        </div>

        {/* UrlForm (center section) */}
        <div className="flex-1 flex justify-center">
          <DashboardUrlForm
            user={user}
            onUrlShortened={handleUrlShortened}
            onSuccessToast={(shortLink: string) =>
              showToast(`Short link created: ${shortLink}`, "new")
            }
            theme={theme}
            defaultExpiryMinutes={defaultExpiryMinutes}
            quickCopy={quickCopy}
          />
        </div>

        {/* User Dropdown and Notification (right section) */}
        <div className="flex items-center gap-3 pt-2">
          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#4F8CFF]/50 shadow-lg ${
                theme === "light"
                  ? "bg-white/90 border border-gray-200 text-gray-700 hover:bg-gray-100"
                  : "bg-[#23263A]/80 backdrop-blur-md border border-[#35384a]/60 text-white hover:bg-[#35384a]/60"
              }`}
            >
              {/* User Avatar */}
              <motion.div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl relative overflow-hidden shadow-lg ${
                  theme === "light"
                    ? "bg-white border border-gray-200 text-gray-800"
                    : "bg-gradient-to-br from-[#35384a]/80 to-[#2a2a3e]/80 border border-gray-600/40 text-white backdrop-blur-sm"
                } ${
                  user.selectedAvatar !== undefined
                    ? getAvatarGlow(predefinedAvatars[user.selectedAvatar])
                    : ""
                }`}
                animate={{
                  boxShadow:
                    user.selectedAvatar !== undefined
                      ? [
                          `0 0 20px ${
                            getAvatarGlow(
                              predefinedAvatars[user.selectedAvatar]
                            ).includes("orange")
                              ? "rgba(251, 146, 60, 0.4)"
                              : getAvatarGlow(
                                  predefinedAvatars[user.selectedAvatar]
                                ).includes("purple")
                              ? "rgba(168, 85, 247, 0.4)"
                              : getAvatarGlow(
                                  predefinedAvatars[user.selectedAvatar]
                                ).includes("yellow")
                              ? "rgba(251, 191, 36, 0.4)"
                              : getAvatarGlow(
                                  predefinedAvatars[user.selectedAvatar]
                                ).includes("pink")
                              ? "rgba(236, 72, 153, 0.4)"
                              : getAvatarGlow(
                                  predefinedAvatars[user.selectedAvatar]
                                ).includes("blue")
                              ? "rgba(59, 130, 246, 0.4)"
                              : getAvatarGlow(
                                  predefinedAvatars[user.selectedAvatar]
                                ).includes("green")
                              ? "rgba(34, 197, 94, 0.4)"
                              : getAvatarGlow(
                                  predefinedAvatars[user.selectedAvatar]
                                ).includes("cyan")
                              ? "rgba(6, 182, 212, 0.4)"
                              : getAvatarGlow(
                                  predefinedAvatars[user.selectedAvatar]
                                ).includes("red")
                              ? "rgba(239, 68, 68, 0.4)"
                              : "rgba(99, 102, 241, 0.4)"
                          }`,
                          `0 0 30px ${
                            getAvatarGlow(
                              predefinedAvatars[user.selectedAvatar]
                            ).includes("orange")
                              ? "rgba(251, 146, 60, 0.2)"
                              : getAvatarGlow(
                                  predefinedAvatars[user.selectedAvatar]
                                ).includes("purple")
                              ? "rgba(168, 85, 247, 0.2)"
                              : getAvatarGlow(
                                  predefinedAvatars[user.selectedAvatar]
                                ).includes("yellow")
                              ? "rgba(251, 191, 36, 0.2)"
                              : getAvatarGlow(
                                  predefinedAvatars[user.selectedAvatar]
                                ).includes("pink")
                              ? "rgba(236, 72, 153, 0.2)"
                              : getAvatarGlow(
                                  predefinedAvatars[user.selectedAvatar]
                                ).includes("blue")
                              ? "rgba(59, 130, 246, 0.2)"
                              : getAvatarGlow(
                                  predefinedAvatars[user.selectedAvatar]
                                ).includes("green")
                              ? "rgba(34, 197, 94, 0.2)"
                              : getAvatarGlow(
                                  predefinedAvatars[user.selectedAvatar]
                                ).includes("cyan")
                              ? "rgba(6, 182, 212, 0.2)"
                              : getAvatarGlow(
                                  predefinedAvatars[user.selectedAvatar]
                                ).includes("red")
                              ? "rgba(239, 68, 68, 0.2)"
                              : "rgba(99, 102, 241, 0.2)"
                          }`,
                        ]
                      : ["0 0 0px rgba(0,0,0,0)", "0 0 0px rgba(0,0,0,0)"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              >
                {/* Animated ring */}
                {user.selectedAvatar !== undefined && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: `conic-gradient(from 0deg, ${
                        getAvatarGlow(
                          predefinedAvatars[user.selectedAvatar]
                        ).includes("orange")
                          ? "#f97316, #fb923c, #f97316"
                          : getAvatarGlow(
                              predefinedAvatars[user.selectedAvatar]
                            ).includes("purple")
                          ? "#a855f7, #c084fc, #a855f7"
                          : getAvatarGlow(
                              predefinedAvatars[user.selectedAvatar]
                            ).includes("yellow")
                          ? "#eab308, #fbbf24, #eab308"
                          : getAvatarGlow(
                              predefinedAvatars[user.selectedAvatar]
                            ).includes("pink")
                          ? "#ec4899, #f472b6, #ec4899"
                          : getAvatarGlow(
                              predefinedAvatars[user.selectedAvatar]
                            ).includes("blue")
                          ? "#3b82f6, #60a5fa, #3b82f6"
                          : getAvatarGlow(
                              predefinedAvatars[user.selectedAvatar]
                            ).includes("green")
                          ? "#22c55e, #4ade80, #22c55e"
                          : getAvatarGlow(
                              predefinedAvatars[user.selectedAvatar]
                            ).includes("cyan")
                          ? "#06b6d4, #22d3ee, #06b6d4"
                          : getAvatarGlow(
                              predefinedAvatars[user.selectedAvatar]
                            ).includes("red")
                          ? "#ef4444, #f87171, #ef4444"
                          : "#6366f1, #818cf8, #6366f1"
                      })`,
                      padding: "2px",
                      opacity: 0.3,
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <div className="w-full h-full rounded-xl bg-[#35384a]/80" />
                  </motion.div>
                )}

                {user.selectedAvatar !== undefined ? (
                  <motion.span
                    className="drop-shadow-sm relative z-10"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {predefinedAvatars[user.selectedAvatar]}
                  </motion.span>
                ) : (
                  <span className="text-white font-bold text-sm relative z-10">
                    {user.name ? user.name.charAt(0).toUpperCase() : "P"}
                  </span>
                )}
              </motion.div>

              {/* User Info */}
              <div className="flex flex-col items-start">
                <span
                  className={`text-sm font-medium ${
                    theme === "light" ? "text-gray-700" : "text-white"
                  }`}
                >
                  Welcome
                </span>
                <span
                  className={`text-xs font-semibold ${
                    theme === "light" ? "text-blue-600" : "text-[#4F8CFF]"
                  }`}
                >
                  {user.name
                    ? user.name.charAt(0).toUpperCase() +
                      user.name.slice(1).toLowerCase()
                    : "Piyush"}
                </span>
              </div>

              {/* Dropdown Arrow */}
              <FiChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  showDropdown ? "rotate-180" : ""
                } ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
              />
            </motion.button>

            {/* Enhanced Dropdown Menu */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`absolute right-0 mt-3 w-64 rounded-2xl py-3 z-50 overflow-hidden backdrop-blur-xl transition-colors duration-200 ${
                    theme === "light"
                      ? "bg-white/95 border border-gray-200 shadow-md"
                      : "bg-[#23263A]/90 border border-[#35384a]/60 shadow-2xl shadow-[#4F8CFF]/20"
                  }`}
                >
                  {/* User Info Header */}
                  <div
                    className={`px-4 py-3 border-b ${
                      theme === "light"
                        ? "border-gray-200"
                        : "border-[#35384a]/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4F8CFF] to-[#E052CB] flex items-center justify-center text-white font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : "P"}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            theme === "light" ? "text-gray-900" : "text-white"
                          }`}
                        >
                          {user.name
                            ? user.name.charAt(0).toUpperCase() +
                              user.name.slice(1).toLowerCase()
                            : "Piyush"}
                        </p>
                        <p
                          className={`text-xs ${
                            theme === "light"
                              ? "text-gray-600"
                              : "text-gray-400"
                          }`}
                        >
                          {user.email || "pk1@gmail.com"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <motion.button
                      whileHover={{
                        backgroundColor:
                          theme === "light"
                            ? "rgba(0,0,0,0.04)"
                            : "rgba(53, 56, 74, 0.6)",
                      }}
                      onClick={handleOpenProfileModal}
                      aria-haspopup="menu"
                      className={`w-full px-4 py-3 text-left text-sm transition-all duration-200 flex items-center gap-3 group ${
                        theme === "light"
                          ? "text-gray-700 hover:text-gray-900"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          theme === "light"
                            ? "bg-blue-50 group-hover:bg-blue-100"
                            : "bg-[#4F8CFF]/20 group-hover:bg-[#4F8CFF]/30"
                        }`}
                      >
                        <FiUser
                          className={`w-4 h-4 ${
                            theme === "light"
                              ? "text-blue-600"
                              : "text-[#4F8CFF]"
                          }`}
                        />
                      </div>
                      <span className="font-medium">Profile Settings</span>
                    </motion.button>

                    <motion.button
                      whileHover={{
                        backgroundColor:
                          theme === "light"
                            ? "rgba(0,0,0,0.04)"
                            : "rgba(53, 56, 74, 0.6)",
                      }}
                      onClick={handleOpenAccountModal}
                      className={`w-full px-4 py-3 text-left text-sm transition-all duration-200 flex items-center gap-3 group ${
                        theme === "light"
                          ? "text-gray-700 hover:text-gray-900"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          theme === "light"
                            ? "bg-green-50 group-hover:bg-green-100"
                            : "bg-green-500/20 group-hover:bg-green-500/30"
                        }`}
                      >
                        <FiShield
                          className={`w-4 h-4 ${
                            theme === "light"
                              ? "text-green-600"
                              : "text-green-400"
                          }`}
                        />
                      </div>
                      <span className="font-medium">Account Settings</span>
                    </motion.button>

                    <motion.button
                      whileHover={{
                        backgroundColor:
                          theme === "light"
                            ? "rgba(0,0,0,0.04)"
                            : "rgba(53, 56, 74, 0.6)",
                      }}
                      onClick={() => setShowAppearanceModal(true)}
                      className={`w-full px-4 py-3 text-left text-sm transition-all duration-200 flex items-center gap-3 group ${
                        theme === "light"
                          ? "text-gray-700 hover:text-gray-900"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          theme === "light"
                            ? "bg-purple-50 group-hover:bg-purple-100"
                            : "bg-purple-500/20 group-hover:bg-purple-500/30"
                        }`}
                      >
                        <FiSun
                          className={`w-4 h-4 ${
                            theme === "light"
                              ? "text-purple-600"
                              : "text-purple-400"
                          }`}
                        />
                      </div>
                      <span className="font-medium">Appearance</span>
                    </motion.button>
                  </div>

                  {/* Divider */}
                  <div
                    className={`my-2 mx-4 border-t ${
                      theme === "light"
                        ? "border-gray-200"
                        : "border-[#35384a]/50"
                    }`}
                  ></div>

                  {/* Sign Out */}
                  <motion.button
                    whileHover={{
                      backgroundColor:
                        theme === "light"
                          ? "rgba(239, 68, 68, 0.08)"
                          : "rgba(239, 68, 68, 0.1)",
                    }}
                    onClick={handleLogout}
                    className={`w-full px-4 py-3 text-left text-sm transition-all duration-200 flex items-center gap-3 group ${
                      theme === "light"
                        ? "text-red-600 hover:text-red-700"
                        : "text-red-400 hover:text-red-300"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        theme === "light"
                          ? "bg-red-50 group-hover:bg-red-100"
                          : "bg-red-500/20 group-hover:bg-red-500/30"
                      }`}
                    >
                      <FiLogOut
                        className={`w-4 h-4 ${
                          theme === "light" ? "text-red-600" : "text-red-400"
                        }`}
                      />
                    </div>
                    <span className="font-medium">Sign Out</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-offset-1 relative ${
                theme === "light"
                  ? "bg-white/90 text-gray-700 hover:bg-gray-100 border border-gray-200"
                  : "bg-[#4F8CFF] text-white hover:bg-[#3973d6]"
              }`}
            >
              <FiBell
                className={`w-5 h-5 ${
                  theme === "light" ? "text-blue-600" : ""
                }`}
              />
              {notifications.length > 0 && (
                <span
                  className={`absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-bold ${
                    theme === "light"
                      ? "bg-[#E052CB]/90 border border-white/80"
                      : "bg-[#E052CB]"
                  }`}
                >
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div
                className={`absolute right-0 mt-2 w-72 backdrop-blur-md rounded-xl py-2 z-50 transition-colors duration-200 ${
                  theme === "light"
                    ? "bg-white/95 border border-gray-200 shadow-md"
                    : "bg-[#23263A]/90 border border-[#35384a]/60 shadow-lg shadow-[#4F8CFF]/10"
                }`}
              >
                <div
                  className={`px-4 py-2 border-b ${
                    theme === "light" ? "border-gray-200" : "border-[#35384a]"
                  }`}
                >
                  <h3
                    className={`text-sm font-medium ${
                      theme === "light" ? "text-gray-900" : "text-white"
                    }`}
                  >
                    Notifications
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 border-b last:border-b-0 ${
                        theme === "light"
                          ? "hover:bg-gray-50 border-gray-100"
                          : "hover:bg-[#35384a] border-[#35384a]"
                      }`}
                    >
                      <p
                        className={`text-sm ${
                          theme === "light" ? "text-gray-700" : "text-gray-300"
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          theme === "light" ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        Just now
                      </p>
                    </div>
                  ))}
                </div>
                <div
                  className={`px-4 py-2 border-t ${
                    theme === "light" ? "border-gray-200" : "border-[#35384a]"
                  }`}
                >
                  <button
                    className={`text-xs ${
                      theme === "light" ? "text-blue-600" : "text-[#4F8CFF]"
                    }`}
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area - Flex layout for non-scrollable dashboard */}
      <main className="relative flex-1 flex flex-col overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col flex-1">
          {/* Feature Tabs */}
          <div className="flex justify-center mb-6">
            <div
              className={`flex backdrop-blur-md rounded-full p-1 gap-1 border shadow-lg transition-all duration-300 ${
                theme === "light"
                  ? "bg-white/80 border-gray-300/60 shadow-gray-200/20"
                  : theme === "dark"
                  ? "bg-[#1a1a1a]/80 border-gray-700/60 shadow-purple-500/10"
                  : "bg-[#23263A]/80 border-[#35384a]/60 shadow-[#4F8CFF]/10"
              }`}
            >
              {featureTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 focus:outline-none flex items-center gap-2 ${
                    activeTab === tab.id
                      ? theme === "light"
                        ? "bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white shadow-lg focus:ring-blue-400"
                        : theme === "dark"
                        ? "bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white shadow-lg focus:ring-purple-400"
                        : "bg-gradient-to-r from-[#4F8CFF] to-[#E052CB] text-white shadow-lg focus:ring-[#4F8CFF]"
                      : theme === "light"
                      ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      : theme === "dark"
                      ? "text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
                      : "text-gray-300 hover:bg-[#35384a] hover:text-white"
                  }`}
                  style={{ minWidth: 120 }}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Usage Line - Portfolio Version */}
          <div className="text-center mb-4">
            <p
              className={`text-sm ${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}
            >
              Create unlimited short links with advanced analytics ⚡
            </p>
          </div>

          {/* Content Area - Takes remaining height */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <AnimatePresence mode="wait">
              {/* History tab with smooth Framer Motion animations */}
              {activeTab === "History" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="h-full"
                >
                  <UrlHistoryTable
                    newUrl={newUrl || undefined}
                    user={user}
                    theme={theme}
                  />
                </motion.div>
              )}
              {/* Other tabs with existing smooth animations */}
              {(activeTab === "Statistics" ||
                activeTab === "Click Stream" ||
                activeTab === "Settings") && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="h-full"
                >
                  <DashboardTabs
                    activeTab={activeTab}
                    user={user}
                    theme={theme}
                    // Pass minimal settings through so Settings tab can render controls
                    // (We&apos;ll modify DashboardTabs to use these optional props)
                    defaultExpiryMinutes={defaultExpiryMinutes}
                    onChangeDefaultExpiry={updateDefaultExpiry}
                    quickCopy={quickCopy}
                    onToggleQuickCopy={toggleQuickCopy}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Profile Settings Modal */}
      {showProfileModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowProfileModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={`backdrop-blur-xl border rounded-2xl shadow-2xl w-full max-w-4xl ${
              theme === "light"
                ? "bg-white/95 border-gray-200"
                : "bg-gradient-to-br from-[#1e1e2e]/95 to-[#2a2a3e]/95 border-gray-700/50"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className={`p-6 border-b ${
                theme === "light" ? "border-gray-200" : "border-gray-700/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-xl font-semibold ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  Profile Settings
                </h3>
                <motion.button
                  whileHover={{
                    scale: 1.1,
                    backgroundColor:
                      theme === "light"
                        ? "rgba(239, 68, 68, 0.1)"
                        : "rgba(239, 68, 68, 0.2)",
                  }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowProfileModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === "light"
                      ? "text-gray-500 hover:text-red-600"
                      : "text-gray-400 hover:text-red-400"
                  }`}
                >
                  <FiX className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Profile Form - Two Column Layout */}
            <form onSubmit={handleUpdateProfile} className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Account Information */}
                <div className="space-y-4">
                  <h4
                    className={`text-lg font-medium flex items-center gap-2 ${
                      theme === "light" ? "text-gray-900" : "text-white"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        theme === "light" ? "bg-blue-100" : "bg-[#4F8CFF]/20"
                      }`}
                    >
                      <FiUser
                        className={`w-3 h-3 ${
                          theme === "light" ? "text-blue-600" : "text-[#4F8CFF]"
                        }`}
                      />
                    </div>
                    Account Information
                  </h4>

                  {/* Profile Avatar */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-3 ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      Profile Avatar
                    </label>

                    {/* Current Selected Avatar */}
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`w-16 h-16 rounded-xl border flex items-center justify-center text-3xl shadow-lg backdrop-blur-sm ${
                          theme === "light"
                            ? "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300"
                            : "bg-gradient-to-br from-[#35384a]/80 to-[#2a2a3e]/80 border-gray-600/40"
                        }`}
                      >
                        <span className="drop-shadow-sm">
                          {predefinedAvatars[profileFormData.selectedAvatar]}
                        </span>
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            theme === "light" ? "text-gray-900" : "text-white"
                          }`}
                        >
                          Current Avatar
                        </p>
                        <p
                          className={`text-xs ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          Choose from collection
                        </p>
                      </div>
                    </div>

                    {/* Avatar Grid - More Compact */}
                    <div
                      className={`grid grid-cols-8 gap-1.5 p-3 rounded-lg border max-h-24 overflow-y-auto ${
                        theme === "light"
                          ? "bg-gray-50 border-gray-200"
                          : "bg-[#2a2a3e]/30 border-gray-600/30"
                      }`}
                    >
                      {predefinedAvatars.map((avatar, index) => (
                        <motion.button
                          key={index}
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAvatarSelect(index)}
                          className={`
                            w-8 h-8 rounded-md flex items-center justify-center text-sm transition-all shadow-sm relative overflow-hidden
                            ${
                              profileFormData.selectedAvatar === index
                                ? theme === "light"
                                  ? `bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg scale-110 ring-2 ring-blue-300`
                                  : `bg-gradient-to-br from-[#35384a]/80 to-[#2a2a3e]/80 shadow-lg scale-110 ${getAvatarGlow(
                                      avatar
                                    )}`
                                : theme === "light"
                                ? "bg-gray-100 hover:bg-gray-200 hover:scale-105"
                                : "bg-[#35384a]/60 hover:bg-[#35384a]/80 hover:scale-105"
                            }
                          `}
                          animate={
                            profileFormData.selectedAvatar === index
                              ? {
                                  boxShadow: [
                                    `0 0 15px ${
                                      getAvatarGlow(avatar).includes("orange")
                                        ? "rgba(251, 146, 60, 0.6)"
                                        : getAvatarGlow(avatar).includes(
                                            "purple"
                                          )
                                        ? "rgba(168, 85, 247, 0.6)"
                                        : getAvatarGlow(avatar).includes(
                                            "yellow"
                                          )
                                        ? "rgba(251, 191, 36, 0.6)"
                                        : getAvatarGlow(avatar).includes("pink")
                                        ? "rgba(236, 72, 153, 0.6)"
                                        : getAvatarGlow(avatar).includes("blue")
                                        ? "rgba(59, 130, 246, 0.6)"
                                        : getAvatarGlow(avatar).includes(
                                            "green"
                                          )
                                        ? "rgba(34, 197, 94, 0.6)"
                                        : getAvatarGlow(avatar).includes("cyan")
                                        ? "rgba(6, 182, 212, 0.6)"
                                        : getAvatarGlow(avatar).includes("red")
                                        ? "rgba(239, 68, 68, 0.6)"
                                        : "rgba(99, 102, 241, 0.6)"
                                    }`,
                                    `0 0 25px ${
                                      getAvatarGlow(avatar).includes("orange")
                                        ? "rgba(251, 146, 60, 0.3)"
                                        : getAvatarGlow(avatar).includes(
                                            "purple"
                                          )
                                        ? "rgba(168, 85, 247, 0.3)"
                                        : getAvatarGlow(avatar).includes(
                                            "yellow"
                                          )
                                        ? "rgba(251, 191, 36, 0.3)"
                                        : getAvatarGlow(avatar).includes("pink")
                                        ? "rgba(236, 72, 153, 0.3)"
                                        : getAvatarGlow(avatar).includes("blue")
                                        ? "rgba(59, 130, 246, 0.3)"
                                        : getAvatarGlow(avatar).includes(
                                            "green"
                                          )
                                        ? "rgba(34, 197, 94, 0.3)"
                                        : getAvatarGlow(avatar).includes("cyan")
                                        ? "rgba(6, 182, 212, 0.3)"
                                        : getAvatarGlow(avatar).includes("red")
                                        ? "rgba(239, 68, 68, 0.3)"
                                        : "rgba(99, 102, 241, 0.3)"
                                    }`,
                                  ],
                                }
                              : {}
                          }
                          transition={{
                            duration: 1.5,
                            repeat:
                              profileFormData.selectedAvatar === index
                                ? Infinity
                                : 0,
                            repeatType: "reverse",
                            ease: "easeInOut",
                          }}
                        >
                          {/* Rotating ring for selected avatar */}
                          {profileFormData.selectedAvatar === index && (
                            <motion.div
                              className="absolute inset-0 rounded-md"
                              style={{
                                background: `conic-gradient(from 0deg, ${
                                  getAvatarGlow(avatar).includes("orange")
                                    ? "#f97316, #fb923c, #f97316"
                                    : getAvatarGlow(avatar).includes("purple")
                                    ? "#a855f7, #c084fc, #a855f7"
                                    : getAvatarGlow(avatar).includes("yellow")
                                    ? "#eab308, #fbbf24, #eab308"
                                    : getAvatarGlow(avatar).includes("pink")
                                    ? "#ec4899, #f472b6, #ec4899"
                                    : getAvatarGlow(avatar).includes("blue")
                                    ? "#3b82f6, #60a5fa, #3b82f6"
                                    : getAvatarGlow(avatar).includes("green")
                                    ? "#22c55e, #4ade80, #22c55e"
                                    : getAvatarGlow(avatar).includes("cyan")
                                    ? "#06b6d4, #22d3ee, #06b6d4"
                                    : getAvatarGlow(avatar).includes("red")
                                    ? "#ef4444, #f87171, #ef4444"
                                    : "#6366f1, #818cf8, #6366f1"
                                })`,
                                padding: "1px",
                                opacity: 0.4,
                              }}
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            >
                              <div className="w-full h-full rounded-md bg-[#35384a]/80" />
                            </motion.div>
                          )}

                          <motion.span
                            className="relative z-10"
                            animate={
                              profileFormData.selectedAvatar === index
                                ? {
                                    scale: [1, 1.15, 1],
                                    rotate: [0, 8, -8, 0],
                                  }
                                : {}
                            }
                            transition={{
                              duration: 2,
                              repeat:
                                profileFormData.selectedAvatar === index
                                  ? Infinity
                                  : 0,
                              ease: "easeInOut",
                            }}
                          >
                            {avatar}
                          </motion.span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileFormData.username}
                      onChange={(e) =>
                        setProfileFormData({
                          ...profileFormData,
                          username: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 border rounded-xl transition-all ${
                        theme === "light"
                          ? "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          : "bg-[#2a2a3e]/80 border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F8CFF]/50 focus:border-[#4F8CFF]/50"
                      }`}
                      placeholder="Enter your username"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileFormData.email}
                      onChange={(e) =>
                        setProfileFormData({
                          ...profileFormData,
                          email: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 border rounded-xl transition-all ${
                        theme === "light"
                          ? "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          : "bg-[#2a2a3e]/80 border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F8CFF]/50 focus:border-[#4F8CFF]/50"
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Right Column - Additional Information */}
                <div className="space-y-4">
                  <h4
                    className={`text-lg font-medium flex items-center gap-2 ${
                      theme === "light" ? "text-gray-900" : "text-white"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        theme === "light" ? "bg-purple-100" : "bg-[#8B5CF6]/20"
                      }`}
                    >
                      <FiUser
                        className={`w-3 h-3 ${
                          theme === "light"
                            ? "text-purple-600"
                            : "text-[#8B5CF6]"
                        }`}
                      />
                    </div>
                    Additional Information
                  </h4>

                  {/* Bio */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      Bio
                    </label>
                    <textarea
                      value={profileFormData.bio}
                      onChange={(e) =>
                        setProfileFormData({
                          ...profileFormData,
                          bio: e.target.value,
                        })
                      }
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-xl transition-all resize-none ${
                        theme === "light"
                          ? "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          : "bg-[#2a2a3e]/80 border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F8CFF]/50 focus:border-[#4F8CFF]/50"
                      }`}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      Location
                    </label>
                    <input
                      type="text"
                      value={profileFormData.location}
                      onChange={(e) =>
                        setProfileFormData({
                          ...profileFormData,
                          location: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 border rounded-xl transition-all ${
                        theme === "light"
                          ? "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          : "bg-[#2a2a3e]/80 border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F8CFF]/50 focus:border-[#4F8CFF]/50"
                      }`}
                      placeholder="e.g., New York, USA"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      Website
                    </label>
                    <input
                      type="url"
                      value={profileFormData.website}
                      onChange={(e) =>
                        setProfileFormData({
                          ...profileFormData,
                          website: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 border rounded-xl transition-all ${
                        theme === "light"
                          ? "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          : "bg-[#2a2a3e]/80 border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F8CFF]/50 focus:border-[#4F8CFF]/50"
                      }`}
                      placeholder="https://your-website.com"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={profileFormData.dateOfBirth}
                      onChange={(e) =>
                        setProfileFormData({
                          ...profileFormData,
                          dateOfBirth: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 border rounded-xl transition-all ${
                        theme === "light"
                          ? "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          : "bg-[#2a2a3e]/80 border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F8CFF]/50 focus:border-[#4F8CFF]/50"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                className={`flex gap-3 pt-6 border-t mt-6 ${
                  theme === "light" ? "border-gray-200" : "border-gray-700/50"
                }`}
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowProfileModal(false)}
                  className={`flex-1 px-6 py-2.5 rounded-xl font-medium transition-all ${
                    theme === "light"
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-gray-600/30 text-gray-300 hover:bg-gray-600/40"
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={profileLoading}
                  whileHover={{ scale: profileLoading ? 1 : 1.02 }}
                  whileTap={{ scale: profileLoading ? 1 : 0.98 }}
                  className="flex-1 px-6 py-2.5 bg-gradient-to-r from-[#4F8CFF] to-[#6C5CE7] text-white rounded-xl font-medium hover:from-[#5A9AFF] hover:to-[#7D6EF7] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {profileLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Account Settings Modal */}
      {showAccountModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAccountModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={`backdrop-blur-xl border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden ${
              theme === "light"
                ? "bg-white/95 border-gray-200"
                : "bg-gradient-to-br from-[#2a2a3e]/95 to-[#1e1e2e]/95 border-gray-600/30"
            }`}
          >
            {/* Header */}
            <div
              className={`px-6 py-4 border-b ${
                theme === "light"
                  ? "border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50"
                  : "border-gray-600/30 bg-gradient-to-r from-[#35384a]/50 to-[#2a2a3e]/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      theme === "light"
                        ? "bg-gradient-to-br from-green-100 to-emerald-100"
                        : "bg-gradient-to-br from-green-500/20 to-emerald-600/20"
                    }`}
                  >
                    <FiShield
                      className={`w-5 h-5 ${
                        theme === "light" ? "text-green-600" : "text-green-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h2
                      className={`text-xl font-bold ${
                        theme === "light" ? "text-gray-900" : "text-white"
                      }`}
                    >
                      Account Settings
                    </h2>
                    <p
                      className={`text-sm ${
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      Change your password
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAccountModal(false)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    theme === "light"
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                      : "bg-gray-600/30 hover:bg-gray-600/50 text-gray-400 hover:text-white"
                  }`}
                >
                  <FiX className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleChangePassword} className="p-6 space-y-6">
              {/* Current Password */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  Current Password
                </label>
                <input
                  type="password"
                  value={accountFormData.currentPassword}
                  onChange={(e) =>
                    setAccountFormData({
                      ...accountFormData,
                      currentPassword: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 border rounded-xl transition-all ${
                    theme === "light"
                      ? "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      : "bg-[#2a2a3e]/80 border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                  }`}
                  placeholder="Enter your current password"
                  required
                />
              </div>

              {/* New Password */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  New Password
                </label>
                <input
                  type="password"
                  value={accountFormData.newPassword}
                  onChange={(e) =>
                    setAccountFormData({
                      ...accountFormData,
                      newPassword: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 border rounded-xl transition-all ${
                    theme === "light"
                      ? "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      : "bg-[#2a2a3e]/80 border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                  }`}
                  placeholder="Enter your new password"
                  required
                />

                {/* Password Strength Indicator */}
                {accountFormData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex-1 h-2 rounded-full overflow-hidden ${
                          theme === "light" ? "bg-gray-200" : "bg-gray-600/30"
                        }`}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${
                              (getPasswordStrength(accountFormData.newPassword)
                                .level /
                                4) *
                              100
                            }%`,
                          }}
                          className={`h-full transition-all duration-300 ${
                            getPasswordStrength(accountFormData.newPassword)
                              .level === 1
                              ? "bg-red-500"
                              : getPasswordStrength(accountFormData.newPassword)
                                  .level === 2
                              ? "bg-yellow-500"
                              : getPasswordStrength(accountFormData.newPassword)
                                  .level === 3
                              ? "bg-blue-500"
                              : "bg-green-500"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          getPasswordStrength(accountFormData.newPassword).color
                        }`}
                      >
                        {getPasswordStrength(accountFormData.newPassword).text}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={accountFormData.confirmPassword}
                  onChange={(e) =>
                    setAccountFormData({
                      ...accountFormData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 border rounded-xl transition-all ${
                    theme === "light"
                      ? "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      : "bg-[#2a2a3e]/80 border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                  }`}
                  placeholder="Confirm your new password"
                  required
                />

                {/* Password Match Indicator */}
                {accountFormData.confirmPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    {accountFormData.newPassword ===
                    accountFormData.confirmPassword ? (
                      <div className="flex items-center gap-1 text-green-400 text-xs">
                        <div className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center">
                          <span className="text-[10px]">✓</span>
                        </div>
                        Passwords match
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-400 text-xs">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 flex items-center justify-center">
                          <span className="text-[10px]">✕</span>
                        </div>
                        Passwords don&apos;t match
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAccountModal(false)}
                  className={`flex-1 px-6 py-2.5 rounded-xl font-medium transition-all ${
                    theme === "light"
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-gray-600/30 text-gray-300 hover:bg-gray-600/40"
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={accountLoading}
                  whileHover={{ scale: accountLoading ? 1 : 1.02 }}
                  whileTap={{ scale: accountLoading ? 1 : 0.98 }}
                  className="flex-1 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {accountLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Appearance Modal */}
      {showAppearanceModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAppearanceModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={`backdrop-blur-xl border rounded-2xl shadow-2xl w-full max-w-md ${
              theme === "light"
                ? "bg-white/95 border-gray-200"
                : "bg-gradient-to-br from-[#1e1e2e]/95 to-[#2a2a3e]/95 border-gray-700/50"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`p-6 border-b flex items-center justify-between ${
                theme === "light" ? "border-gray-200" : "border-gray-700/50"
              }`}
            >
              <h3
                className={`text-xl font-semibold ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                Appearance
              </h3>
              <motion.button
                whileHover={{
                  scale: 1.1,
                  backgroundColor:
                    theme === "light"
                      ? "rgba(239, 68, 68, 0.1)"
                      : "rgba(239, 68, 68, 0.2)",
                }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowAppearanceModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === "light"
                    ? "text-gray-500 hover:text-red-600"
                    : "text-gray-400 hover:text-red-400"
                }`}
              >
                <FiX className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {themes.map((t) => (
                  <motion.button
                    key={t.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-xl font-medium transition-all duration-300 border shadow-lg ${
                      theme === t.id
                        ? theme === "light"
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-800"
                          : "bg-gradient-to-r from-[#4F8CFF]/20 to-[#E052CB]/20 border-gray-700/40 text-white"
                        : theme === "light"
                        ? "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        : "bg-[#23263A]/60 border-gray-700/40 text-gray-300 hover:bg-[#35384a]/60 hover:text-white"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        theme === "light" ? "bg-gray-100" : "bg-[#35384a]/40"
                      }`}
                    >
                      {t.icon}
                    </div>
                    <span className="text-lg">{t.label}</span>
                    {theme === t.id && (
                      <span
                        className={`ml-auto font-bold ${
                          theme === "light"
                            ? "text-green-600"
                            : "text-green-400"
                        }`}
                      >
                        ✓
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[60] space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className={`
                px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border max-w-sm overflow-hidden relative group
                ${
                  toast.type === "success"
                    ? theme === "light"
                      ? "bg-gradient-to-r from-green-50/95 to-emerald-50/95 border-green-200 text-green-800"
                      : "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-100"
                    : toast.type === "error"
                    ? theme === "light"
                      ? "bg-gradient-to-r from-red-50/95 to-rose-50/95 border-red-200 text-red-800"
                      : "bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/30 text-red-100"
                    : toast.type === "new"
                    ? theme === "light"
                      ? "bg-gradient-to-r from-blue-50/95 via-purple-50/95 to-pink-50/95 border-blue-200 text-blue-800"
                      : "bg-gradient-to-r from-[#4F8CFF]/25 via-[#6C5CE7]/25 to-[#E052CB]/25 border-[#4F8CFF]/40 text-white"
                    : theme === "light"
                    ? "bg-gradient-to-r from-blue-50/95 to-indigo-50/95 border-blue-200 text-blue-800"
                    : "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-100"
                }
              `}
            >
              {toast.type === "new" && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#4F8CFF]/40 via-[#8B5CF6]/40 to-[#E052CB]/40 blur-xl animate-pulse" />
                </div>
              )}
              <div className="flex items-start gap-3">
                <div
                  className={`
                  w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                  ${
                    toast.type === "success"
                      ? theme === "light"
                        ? "bg-green-100"
                        : "bg-green-500/30"
                      : toast.type === "error"
                      ? theme === "light"
                        ? "bg-red-100"
                        : "bg-red-500/30"
                      : toast.type === "new"
                      ? theme === "light"
                        ? "bg-gradient-to-r from-blue-100 to-purple-100"
                        : "bg-gradient-to-r from-[#4F8CFF]/60 to-[#E052CB]/60"
                      : theme === "light"
                      ? "bg-blue-100"
                      : "bg-blue-500/30"
                  }
                `}
                >
                  {toast.type === "success" && (
                    <span
                      className={`text-sm ${
                        theme === "light" ? "text-green-600" : "text-green-400"
                      }`}
                    >
                      ✓
                    </span>
                  )}
                  {toast.type === "error" && (
                    <span
                      className={`text-sm ${
                        theme === "light" ? "text-red-600" : "text-red-400"
                      }`}
                    >
                      ✕
                    </span>
                  )}
                  {toast.type === "info" && (
                    <span
                      className={`text-sm ${
                        theme === "light" ? "text-blue-600" : "text-blue-400"
                      }`}
                    >
                      i
                    </span>
                  )}
                  {toast.type === "new" && (
                    <FiLink
                      className={`w-3.5 h-3.5 ${
                        theme === "light" ? "text-blue-600" : "text-white"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-relaxed">
                    {toast.message}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeToast(toast.id)}
                  className={`transition-colors ${
                    theme === "light"
                      ? "text-gray-500 hover:text-gray-700"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FiX className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
