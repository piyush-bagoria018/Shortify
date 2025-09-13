"use client";
// components/UrlHistoryTable.tsx
import { useState, useEffect } from "react";
import {
  FiCopy,
  FiEdit,
  FiTrash2,
  FiExternalLink,
  FiX,
  FiCheck,
  FiRefreshCcw,
} from "react-icons/fi";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { HiOutlineQrCode } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { getWebsiteIcon, formatDate } from "../utils/websiteIcons";
import QrCodeModal from "./QrCodeModal";
import { buildApiUrl, buildShortUrl } from "../config/api";
import { getAuthHeaders } from "@/config/api";

interface UrlData {
  _id: string;
  id?: string;
  shortLink: string;
  shortCode: string;
  originalUrl: string;
  clicks?: number;
  createdAt: string;
  customCode?: string;
  expiresAt?: string;
  status?: string;
  validityMinutes?: number;
  userId?: string;
}

interface UrlHistoryTableProps {
  newUrl?: {
    shortLink: string;
    originalUrl: string;
    clicks?: number;
    status?: string;
    createdAt?: string;
  }; // New URL added from form
  user?: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  theme?: string;
}

export default function UrlHistoryTable({
  newUrl,
  user,
  theme = "glass",
}: UrlHistoryTableProps) {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  // Add toast notification state
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  // Show notification function
  const showNotification = (
    type: "success" | "error" | "warning",
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemToEdit, setItemToEdit] = useState<UrlData | null>(null);
  const [editFormData, setEditFormData] = useState({ originalUrl: "" });

  // Fetch user's URLs
  const fetchUrls = async () => {
    try {
      const response = await fetch(buildApiUrl("/shorturls/user/urls"), {
        credentials: "include",
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data.urls)) {
          // Normalize ID field to ensure _id exists
          const normalizedUrls = data.data.urls.map((url: UrlData) => ({
            ...url,
            _id: url._id || url.id, // Ensure _id exists
          }));
          setUrls(normalizedUrls);
        } else {
          setUrls([]);
        }
      } else {
        setUrls([]);
        setError("Failed to fetch URLs");
      }
    } catch (error) {
      console.error("Error fetching URLs:", error);
      setUrls([]);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUrls();
    setRefreshing(false);
    // Optionally show a subtle notification only if not already showing an error
    if (!error) {
      showNotification("success", "History updated");
    }
  };

  useEffect(() => {
    if (user) {
      fetchUrls();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Add new URL to the top of the list
  useEffect(() => {
    if (newUrl && user) {
      const formattedNewUrl: UrlData = {
        _id: Date.now().toString(), // Temporary ID
        shortLink: newUrl.shortLink,
        shortCode: newUrl.shortLink.split("/").pop() || "",
        originalUrl: newUrl.originalUrl,
        clicks: 0,
        status: "Active",
        createdAt: new Date().toISOString(),
        validityMinutes: 30,
        userId: user.id,
      };

      setUrls((prevUrls) => [formattedNewUrl, ...prevUrls]);
    }
  }, [newUrl, user]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleDelete = async (urlId: string) => {
    setItemToDelete(urlId);
    setShowDeleteModal(true);
  };

  const handleEdit = async (urlId: string) => {
    const urlItem = urls.find((u) => u._id === urlId);
    if (!urlItem) return;
    setItemToEdit(urlItem);
    setEditFormData({ originalUrl: urlItem.originalUrl });
    setShowEditModal(true);
  };

  const handleShowQrCode = (shortCode: string) => {
    const fullUrl = buildShortUrl(shortCode);
    setQrUrl(fullUrl);
    setShowQrModal(true);
  };

  const handleBulkDelete = async () => {
    if (selectedUrls.length === 0) {
      showNotification("warning", "Please select URLs to delete");
      return;
    }
    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedUrls.length === 0) {
      setShowBulkDeleteModal(false);
      return;
    }

    const shortCodes = selectedUrls
      .map((id) => urls.find((u) => u._id === id))
      .filter((u): u is UrlData => Boolean(u))
      .map((u) => u.shortCode);
    try {
      const res = await fetch(buildApiUrl("/shorturls/bulk/delete"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ shortCodes }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUrls((prev) => prev.filter((u) => !selectedUrls.includes(u._id)));
        setSelectedUrls([]);
        showNotification(
          "success",
          `Successfully deleted ${shortCodes.length} URLs`
        );
        setShowBulkDeleteModal(false);
      } else {
        showNotification("error", data.message || "Bulk delete failed");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Network error during bulk delete");
    }
  };

  const handleBulkToggle = async (makeActive: boolean) => {
    if (selectedUrls.length === 0) {
      showNotification(
        "warning",
        `Please select URLs to ${makeActive ? "activate" : "deactivate"}`
      );
      return;
    }

    const shortCodes = selectedUrls
      .map((id) => urls.find((u) => u._id === id))
      .filter((u): u is UrlData => Boolean(u))
      .map((u) => u.shortCode);
    try {
      const res = await fetch(buildApiUrl("/shorturls/bulk/toggle"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ shortCodes, makeActive }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh URLs from server to get correct status calculation
        await fetchUrls();
        setSelectedUrls([]);
        showNotification(
          "success",
          `Successfully ${makeActive ? "activated" : "deactivated"} ${
            shortCodes.length
          } URLs`
        );
      } else {
        showNotification("error", data.message || "Bulk toggle failed");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Network error during bulk toggle");
    }
  };

  const filteredUrls = urls.filter((url) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "active") return url.status === "Active";
    if (filterStatus === "inactive") return url.status !== "Active";
    return true;
  });

  const handleSelectUrl = (urlId: string) => {
    setSelectedUrls((prev) =>
      prev.includes(urlId)
        ? prev.filter((id) => id !== urlId)
        : [...prev, urlId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUrls(
      selectedUrls.length === filteredUrls.length
        ? []
        : filteredUrls.map((url) => url._id)
    );
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const urlItem = urls.find((u) => u._id === itemToDelete);
      if (!urlItem) return;
      const shortcode = urlItem.shortCode;
      const res = await fetch(buildApiUrl(`/shorturls/${shortcode}`), {
        method: "DELETE",
        credentials: "include",
        headers: {
          ...getAuthHeaders(),
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUrls((prev) => prev.filter((u) => u._id !== itemToDelete));
        setShowDeleteModal(false);
        setItemToDelete(null);
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while deleting");
    }
  };

  const confirmEdit = async () => {
    if (!itemToEdit || !editFormData.originalUrl.trim()) return;
    if (editFormData.originalUrl === itemToEdit.originalUrl) {
      setShowEditModal(false);
      return;
    }
    try {
      const res = await fetch(
        buildApiUrl(`/shorturls/${itemToEdit.shortCode}`),
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ originalUrl: editFormData.originalUrl }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setUrls((prev) =>
          prev.map((u) =>
            u._id === itemToEdit._id
              ? { ...u, originalUrl: data.data.originalUrl }
              : u
          )
        );
        setShowEditModal(false);
        setItemToEdit(null);
        setEditFormData({ originalUrl: "" });
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while updating");
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className={`h-full rounded-xl border flex items-center justify-center ${
          theme === "light"
            ? "bg-white border-gray-200"
            : theme === "dark"
            ? "bg-[#1a1a1a] border-gray-700"
            : "bg-[#23263A] border-[#35384a]"
        }`}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`text-center py-8 ${
            theme === "light" ? "text-gray-600" : "text-[#A1A8B3]"
          }`}
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mb-3"
          >
            <div
              className={`w-8 h-8 mx-auto rounded-full border-2 border-t-transparent animate-spin ${
                theme === "light" ? "border-blue-600" : "border-[#4F8CFF]"
              }`}
            />
          </motion.div>
          Loading your URLs...
        </motion.div>
      </motion.div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className={`h-full rounded-xl border flex items-center justify-center ${
          theme === "light"
            ? "bg-white border-gray-200"
            : theme === "dark"
            ? "bg-[#1a1a1a] border-gray-700"
            : "bg-[#23263A] border-[#35384a]"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className={`text-center py-8 ${
            theme === "light" ? "text-gray-600" : "text-[#A1A8B3]"
          }`}
        >
          Please{" "}
          <a
            href="/login"
            className={`underline transition-colors hover:opacity-80 ${
              theme === "light" ? "text-blue-600" : "text-[#4F8CFF]"
            }`}
          >
            login
          </a>{" "}
          to view your URL history.
        </motion.div>
      </motion.div>
    );
  }

  if (urls.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className={`h-full rounded-xl border flex items-center justify-center ${
          theme === "light"
            ? "bg-white border-gray-200"
            : theme === "dark"
            ? "bg-[#1a1a1a] border-gray-700"
            : "bg-[#23263A] border-[#35384a]"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`text-center py-8 ${
            theme === "light" ? "text-gray-600" : "text-[#A1A8B3]"
          }`}
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-2xl mb-2"
          >
            🚀
          </motion.div>
          No URLs created yet. Create your first short URL above!
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={`h-full rounded-xl border flex flex-col overflow-hidden ${
        theme === "light"
          ? "bg-white border-gray-200"
          : theme === "dark"
          ? "bg-[#1a1a1a] border-gray-700"
          : "bg-[#23263A] border-[#35384a]"
      }`}
      /* Dynamic height: subtract a little less when bulk bar is visible so rows aren't clipped */
      style={{
        maxHeight: `calc(100vh - ${showBulkEdit ? 280 : 292}px)`,
      }}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-6 border-b flex-shrink-0 ${
          theme === "light"
            ? "border-gray-200"
            : theme === "dark"
            ? "border-gray-700"
            : "border-[#35384a]"
        }`}
      >
        <h3
          className={`text-lg font-semibold ${
            theme === "light" ? "text-gray-900" : "text-[#E5E7EB]"
          }`}
        >
          History ({filteredUrls.length})
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh history"
            className={`px-3 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 transition relative overflow-hidden group ${
              theme === "light"
                ? "bg-gray-100 border-gray-300 text-gray-600 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-60"
                : theme === "dark"
                ? "bg-[#2a2a2a] border-gray-600 text-gray-300 hover:bg-[#4F8CFF] hover:text-white disabled:opacity-50"
                : "bg-[#35384a] border-[#35384a] text-[#A1A8B3] hover:bg-[#4F8CFF] hover:text-white disabled:opacity-50"
            }`}
          >
            <FiRefreshCcw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>{refreshing ? "Refreshing" : "Refresh"}</span>
          </button>
          <button
            onClick={() => setShowBulkEdit(!showBulkEdit)}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition ${
              showBulkEdit
                ? theme === "light"
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-[#4F8CFF] border-[#4F8CFF] text-white"
                : theme === "light"
                ? "bg-gray-100 border-gray-300 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                : theme === "dark"
                ? "bg-[#2a2a2a] border-gray-600 text-gray-300 hover:bg-[#4F8CFF] hover:text-white"
                : "bg-[#35384a] border-[#35384a] text-[#A1A8B3] hover:bg-[#4F8CFF] hover:text-white"
            }`}
          >
            <FiEdit className="w-4 h-4 inline mr-2" />
            Bulk Edit
          </button>
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition ${
                showFilter
                  ? theme === "light"
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "bg-[#4F8CFF] border-[#4F8CFF] text-white"
                  : theme === "light"
                  ? "bg-gray-100 border-gray-300 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  : theme === "dark"
                  ? "bg-[#2a2a2a] border-gray-600 text-gray-300 hover:bg-[#4F8CFF] hover:text-white"
                  : "bg-[#35384a] border-[#35384a] text-[#A1A8B3] hover:bg-[#4F8CFF] hover:text-white"
              }`}
            >
              Filter
            </button>
            {showFilter && (
              <div
                className={`absolute right-0 mt-2 w-40 border rounded-lg shadow-lg py-2 z-50 ${
                  theme === "light"
                    ? "bg-white border-gray-200"
                    : theme === "dark"
                    ? "bg-[#1a1a1a] border-gray-700"
                    : "bg-[#181B23] border-[#35384a]"
                }`}
              >
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`w-full px-4 py-2 text-left text-sm transition ${
                    filterStatus === "all"
                      ? theme === "light"
                        ? "text-blue-600"
                        : "text-[#4F8CFF]"
                      : theme === "light"
                      ? "text-gray-700 hover:text-blue-600"
                      : "text-[#A1A8B3] hover:text-white"
                  }`}
                >
                  All URLs
                </button>
                <button
                  onClick={() => setFilterStatus("active")}
                  className={`w-full px-4 py-2 text-left text-sm transition ${
                    filterStatus === "active"
                      ? theme === "light"
                        ? "text-blue-600"
                        : "text-[#4F8CFF]"
                      : theme === "light"
                      ? "text-gray-700 hover:text-blue-600"
                      : "text-[#A1A8B3] hover:text-white"
                  }`}
                >
                  Active Only
                </button>
                <button
                  onClick={() => setFilterStatus("inactive")}
                  className={`w-full px-4 py-2 text-left text-sm transition ${
                    filterStatus === "inactive"
                      ? theme === "light"
                        ? "text-blue-600"
                        : "text-[#4F8CFF]"
                      : theme === "light"
                      ? "text-gray-700 hover:text-blue-600"
                      : "text-[#A1A8B3] hover:text-white"
                  }`}
                >
                  Inactive Only
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showBulkEdit && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center justify-between p-4 rounded-lg mx-4 mt-4 mb-2 backdrop-blur-sm transition-colors duration-200 ${
            theme === "light"
              ? "bg-white/95 border border-gray-200"
              : "bg-[#181B23]/80 border border-[#35384a]"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#4F8CFF] rounded-full animate-pulse" />
            <span
              className={`${
                theme === "light" ? "text-gray-700" : "text-[#A1A8B3]"
              } text-sm font-medium`}
            >
              {selectedUrls.length} URL{selectedUrls.length !== 1 ? "s" : ""}{" "}
              selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBulkDelete}
              disabled={selectedUrls.length === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                theme === "light"
                  ? "bg-red-600 text-white shadow-sm hover:shadow-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              <FiTrash2 className="w-4 h-4" />
              Delete Selected
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleBulkToggle(true)}
              disabled={selectedUrls.length === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                theme === "light"
                  ? "bg-green-600 text-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              <FaCheckCircle className="w-4 h-4" />
              Activate Selected
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleBulkToggle(false)}
              disabled={selectedUrls.length === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                theme === "light"
                  ? "bg-gray-100 text-gray-700 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              <FaTimesCircle className="w-4 h-4" />
              Deactivate Selected
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Table Container with Custom Scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar pb-6">
        <table className="w-full table-fixed text-left align-middle min-w-0">
          <thead
            className={`sticky top-0 text-[15px] font-semibold tracking-wide border-b ${
              theme === "light"
                ? "bg-gray-50 text-gray-700 border-gray-200"
                : theme === "dark"
                ? "bg-[#0f0f0f] text-gray-300 border-gray-700"
                : "bg-[#181B23] text-[#A1A8B3] border-[#35384a]"
            }`}
          >
            <tr>
              {showBulkEdit && (
                <th className="py-4 px-4 font-semibold">
                  <input
                    type="checkbox"
                    checked={
                      selectedUrls.length === filteredUrls.length &&
                      filteredUrls.length > 0
                    }
                    onChange={handleSelectAll}
                    className={`w-4 h-4 rounded focus:ring-2 focus:ring-offset-1 ${
                      theme === "light"
                        ? "text-blue-600 bg-white border-gray-300 focus:ring-blue-300"
                        : "text-[#4F8CFF] bg-[#23263A] border-[#35384a] focus:ring-[#4F8CFF]"
                    }`}
                  />
                </th>
              )}
              <th className="py-4 px-6 font-semibold min-w-[180px] text-left">
                Short Link
              </th>
              <th className="py-4 px-6 font-semibold min-w-[220px] text-left">
                Original Link
              </th>
              <th className="py-4 px-6 font-semibold min-w-[90px] text-center">
                QR Code
              </th>
              <th className="py-4 px-6 font-semibold min-w-[90px] text-center">
                Clicks
              </th>
              <th className="py-4 px-6 font-semibold min-w-[110px] text-center">
                Status
              </th>
              <th className="py-4 px-6 font-semibold min-w-[120px] text-center">
                Date
              </th>
              <th className="py-4 px-6 font-semibold min-w-[100px] text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredUrls.map((url, index) => {
                const shortLink = buildShortUrl(url.shortCode);
                const isActive = url.status === "Active" || !url.status;

                return (
                  <motion.tr
                    key={url._id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05, // Stagger animation
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    layout
                    className={`border-b last:border-b-0 transition align-middle group ${
                      theme === "light"
                        ? "border-gray-200 hover:bg-gray-50"
                        : theme === "dark"
                        ? "border-gray-700 hover:bg-[#2a2a2a]/50"
                        : "border-[#35384a] hover:bg-[#181B23]/50"
                    }`}
                  >
                    {showBulkEdit && (
                      <td className="py-4 px-4 align-middle">
                        <input
                          type="checkbox"
                          checked={selectedUrls.includes(url._id)}
                          onChange={() => handleSelectUrl(url._id)}
                          className={`w-4 h-4 rounded focus:ring-2 focus:ring-offset-1 ${
                            theme === "light"
                              ? "text-blue-600 bg-white border-gray-300 focus:ring-blue-300"
                              : "text-[#4F8CFF] bg-[#23263A] border-[#35384a] focus:ring-[#4F8CFF]"
                          }`}
                        />
                      </td>
                    )}
                    <td
                      className={`py-4 px-6 font-medium text-[15px] whitespace-nowrap align-middle ${
                        theme === "light" ? "text-blue-600" : "text-[#4F8CFF]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate">{shortLink}</span>
                        <button
                          onClick={() => copyToClipboard(shortLink)}
                          className={`p-1 rounded-full border transition opacity-0 group-hover:opacity-100 ${
                            theme === "light"
                              ? "bg-gray-100 border-gray-300 hover:bg-gray-200"
                              : theme === "dark"
                              ? "bg-[#2a2a2a] border-gray-600 hover:bg-[#3a3a3a]"
                              : "bg-[#23263A] border-[#35384a] hover:bg-[#35384a]"
                          }`}
                        >
                          <FiCopy
                            className={`w-3 h-3 ${
                              theme === "light"
                                ? "text-gray-600"
                                : "text-[#A1A8B3]"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td
                      className={`py-4 px-6 text-[15px] align-middle ${
                        theme === "light" ? "text-gray-900" : "text-[#E5E7EB]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-md ${
                            theme === "light" ? "bg-gray-100" : "bg-[#181B23]"
                          }`}
                        >
                          {getWebsiteIcon(url.originalUrl)}
                        </span>
                        <span
                          className="truncate max-w-[200px]"
                          title={url.originalUrl}
                        >
                          {url.originalUrl}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center align-middle">
                      <button
                        onClick={() => handleShowQrCode(url.shortCode)}
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-md transition ${
                          theme === "light"
                            ? "bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600"
                            : "bg-[#181B23] hover:bg-[#35384a] text-[#A1A8B3] hover:text-blue-400"
                        }`}
                      >
                        <HiOutlineQrCode className="w-6 h-6" />
                      </button>
                    </td>
                    <td
                      className={`py-4 px-6 text-[15px] font-semibold text-center align-middle ${
                        theme === "light" ? "text-gray-900" : "text-[#E5E7EB]"
                      }`}
                    >
                      {url.clicks}
                    </td>
                    <td className="py-4 px-6 text-center align-middle">
                      {isActive ? (
                        <span
                          className={`inline-flex items-center gap-1 font-semibold text-[13px] rounded-full px-3 py-1 ${
                            theme === "light"
                              ? "text-green-700 bg-green-100 border border-green-200"
                              : "text-green-400 bg-green-900/30 border border-green-500/30"
                          }`}
                        >
                          <FaCheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 font-semibold text-[13px] rounded-full px-3 py-1 ${
                            theme === "light"
                              ? "text-yellow-700 bg-yellow-100 border border-yellow-200"
                              : "text-yellow-400 bg-yellow-900/30 border border-yellow-500/30"
                          }`}
                        >
                          <FaTimesCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td
                      className={`py-4 px-6 text-[13px] text-center align-middle ${
                        theme === "light" ? "text-gray-500" : "text-[#A1A8B3]"
                      }`}
                    >
                      {formatDate(url.createdAt)}
                    </td>
                    <td className="py-4 px-6 text-center align-middle">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleEdit(url._id)}
                          className={`p-2 rounded-md border transition ${
                            theme === "light"
                              ? "bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300"
                              : "bg-[#181B23] hover:bg-[#35384a] border-[#35384a]"
                          }`}
                          title="Edit"
                        >
                          <FiEdit
                            className={`w-4 h-4 ${
                              theme === "light"
                                ? "text-blue-600"
                                : "text-[#A1A8B3]"
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(url._id)}
                          className={`p-2 rounded-md border transition ${
                            theme === "light"
                              ? "bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300"
                              : "bg-[#181B23] hover:bg-red-900/50 border-[#35384a] hover:border-red-500/50"
                          }`}
                          title="Delete"
                        >
                          <FiTrash2
                            className={`w-4 h-4 ${
                              theme === "light"
                                ? "text-red-600"
                                : "text-[#A1A8B3] hover:text-red-400"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl ${
              theme === "light"
                ? "bg-white border-gray-200"
                : "bg-[#23263A] border-[#35384a]"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  theme === "light" ? "bg-red-100" : "bg-red-500/20"
                }`}
              >
                <FiTrash2
                  className={`w-5 h-5 ${
                    theme === "light" ? "text-red-600" : "text-red-400"
                  }`}
                />
              </div>
              <h3
                className={`text-lg font-semibold ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                Delete URL
              </h3>
            </div>
            <p
              className={`mb-6 ${
                theme === "light" ? "text-gray-600" : "text-[#A1A8B3]"
              }`}
            >
              Are you sure you want to delete this short URL? This action cannot
              be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`px-4 py-2 rounded-lg transition ${
                  theme === "light"
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-[#35384a] text-[#A1A8B3] hover:bg-[#4a4f5c]"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl ${
              theme === "light"
                ? "bg-white border-gray-200"
                : "bg-[#23263A] border-[#35384a]"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  theme === "light" ? "bg-red-100" : "bg-red-500/20"
                }`}
              >
                <FiTrash2
                  className={`w-5 h-5 ${
                    theme === "light" ? "text-red-600" : "text-red-400"
                  }`}
                />
              </div>
              <h3
                className={`text-lg font-semibold ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                Delete Selected URLs
              </h3>
            </div>
            <p
              className={`mb-4 ${
                theme === "light" ? "text-gray-600" : "text-[#A1A8B3]"
              }`}
            >
              Are you sure you want to delete
              <span
                className={`font-semibold ${
                  theme === "light" ? "text-red-600" : "text-red-400"
                }`}
              >
                {" "}
                {selectedUrls.length}{" "}
              </span>
              selected URL{selectedUrls.length !== 1 ? "s" : ""}? This action
              cannot be undone.
            </p>
            <ul
              className={`max-h-32 overflow-y-auto rounded-lg border mb-4 p-3 text-xs space-y-1 ${
                theme === "light"
                  ? "bg-gray-50 border-gray-200 text-gray-600"
                  : "bg-[#181B23] border-[#35384a] text-[#A1A8B3]"
              }`}
            >
              {selectedUrls.slice(0, 6).map((id) => {
                const u = urls.find((x) => x._id === id);
                return (
                  <li key={id} className="truncate">
                    {u?.originalUrl}
                  </li>
                );
              })}
              {selectedUrls.length > 6 && (
                <li className="italic">+ {selectedUrls.length - 6} more...</li>
              )}
            </ul>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className={`px-4 py-2 rounded-lg transition ${
                  theme === "light"
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-[#35384a] text-[#A1A8B3] hover:bg-[#4a4f5c]"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && itemToEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl ${
              theme === "light"
                ? "bg-white border border-gray-200"
                : "bg-[#23263A] border border-[#35384a]"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  theme === "light" ? "bg-blue-100" : "bg-[#4F8CFF]/20"
                }`}
              >
                <FiEdit
                  className={`w-5 h-5 ${
                    theme === "light" ? "text-blue-600" : "text-[#4F8CFF]"
                  }`}
                />
              </div>
              <h3
                className={`text-lg font-semibold ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                Edit URL
              </h3>
            </div>
            <div className="mb-4">
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === "light" ? "text-gray-700" : "text-[#A1A8B3]"
                }`}
              >
                Original URL
              </label>
              <input
                type="url"
                value={editFormData.originalUrl}
                onChange={(e) =>
                  setEditFormData({ originalUrl: e.target.value })
                }
                className={`w-full px-3 py-2 rounded-lg border transition focus:outline-none ${
                  theme === "light"
                    ? "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white"
                    : "bg-[#181B23] border-[#35384a] text-white placeholder-[#A1A8B3] focus:border-[#4F8CFF]"
                }`}
                placeholder="Enter the URL to redirect to"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className={`px-4 py-2 rounded-lg transition ${
                  theme === "light"
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-[#35384a] text-[#A1A8B3] hover:bg-[#4a4f5c]"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmEdit}
                className="px-4 py-2 bg-[#4F8CFF] text-white rounded-lg hover:bg-[#6BA3FF] transition"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div
            className={`
            px-6 py-4 rounded-xl backdrop-blur-md border shadow-2xl flex items-center gap-3 min-w-[300px]
            ${
              notification.type === "success"
                ? theme === "light"
                  ? "bg-green-50/95 border-green-200 text-green-800"
                  : "bg-green-500/20 border-green-500/30 text-green-300"
                : notification.type === "error"
                ? theme === "light"
                  ? "bg-red-50/95 border-red-200 text-red-800"
                  : "bg-red-500/20 border-red-500/30 text-red-300"
                : theme === "light"
                ? "bg-orange-50/95 border-orange-200 text-orange-800"
                : "bg-orange-500/20 border-orange-500/30 text-orange-300"
            }
          `}
          >
            <div
              className={`
              w-6 h-6 rounded-full flex items-center justify-center
              ${
                notification.type === "success"
                  ? theme === "light"
                    ? "bg-green-100"
                    : "bg-green-500/30"
                  : notification.type === "error"
                  ? theme === "light"
                    ? "bg-red-100"
                    : "bg-red-500/30"
                  : theme === "light"
                  ? "bg-orange-100"
                  : "bg-orange-500/30"
              }
            `}
            >
              {notification.type === "success" && (
                <FaCheckCircle className="w-4 h-4" />
              )}
              {notification.type === "error" && (
                <FaTimesCircle className="w-4 h-4" />
              )}
              {notification.type === "warning" && (
                <FiEdit className="w-4 h-4" />
              )}
            </div>
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className={`ml-auto p-1 rounded-full transition ${
                theme === "light" ? "hover:bg-gray-200" : "hover:bg-white/10"
              }`}
            >
              <FaTimesCircle className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* QR Code Modal */}
      <QrCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        url={qrUrl}
        theme={theme}
      />
    </motion.div>
  );
}
