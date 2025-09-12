"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { buildApiUrl } from "../config/api";
import {
  FiTrendingUp,
  FiLink,
  FiSettings,
  FiEye,
  FiGlobe,
  FiClock,
  FiCalendar,
  FiBarChart,
  FiPieChart,
  FiActivity,
} from "react-icons/fi";
import { FaChrome, FaFirefox, FaSafari, FaEdge } from "react-icons/fa";

interface DashboardTabsProps {
  activeTab: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    selectedAvatar?: number;
    bio?: string;
    location?: string;
    website?: string;
    dateOfBirth?: string;
  };
  theme?: string;
  // Minimal settings props (optional)
  defaultExpiryMinutes?: number;
  onChangeDefaultExpiry?: (val: number) => void;
  quickCopy?: boolean;
  onToggleQuickCopy?: () => void;
}

interface ClickData {
  timestamp: string;
  ip: string;
  userAgent: string;
  country?: string;
  browser?: string;
}

interface UrlAnalytics {
  totalClicks: number;
  uniqueClicks: number;
  clickHistory: ClickData[];
  topCountries: { country: string; clicks: number }[];
  topBrowsers: { browser: string; clicks: number }[];
  dailyClicks: { date: string; clicks: number }[];
}

export default function DashboardTabs({
  activeTab,
  user,
  theme = "glass",
  defaultExpiryMinutes = 30,
  onChangeDefaultExpiry,
  quickCopy = false,
  onToggleQuickCopy,
}: DashboardTabsProps) {
  const [analytics, setAnalytics] = useState<UrlAnalytics>({
    totalClicks: 0,
    uniqueClicks: 0,
    clickHistory: [],
    topCountries: [],
    topBrowsers: [],
    dailyClicks: [],
  });
  const [userPreferences, setUserPreferences] = useState({
    emailNotifications: true,
    analyticsTracking: true,
    publicProfile: false,
    defaultUrlExpiry: 30,
  });
  const [loading, setLoading] = useState(false);

  // Fetch analytics data
  useEffect(() => {
    if (activeTab === "Statistics" && user) {
      fetchAnalytics();
    }
  }, [activeTab, user]);

  // Independent data fetching for Click Stream with auto-refresh
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (activeTab === "Click Stream" && user) {
      // Fetch immediately when tab opens
      fetchAnalytics();

      // Set up auto-refresh every 30 seconds
      interval = setInterval(() => {
        fetchAnalytics();
      }, 30000);
    }

    // Cleanup interval when tab changes or component unmounts
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeTab, user]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch REAL analytics data from backend
      const response = await fetch(buildApiUrl("/shorturls/user/analytics"), {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalytics({
            totalClicks: data.data.totalClicks,
            uniqueClicks: data.data.uniqueClicks,
            clickHistory: data.data.recentClicks.map(
              (click: {
                timestamp: string;
                ip: string;
                browser: string;
                country: string;
              }) => ({
                timestamp: click.timestamp,
                ip: click.ip,
                userAgent: click.browser,
                country: click.country,
                browser: click.browser,
              })
            ),
            topCountries: data.data.topCountries,
            topBrowsers: data.data.topBrowsers,
            dailyClicks: data.data.dailyClicks,
          });
        }
      } else {
        // Fallback to minimal real data if no clicks yet
        setAnalytics({
          totalClicks: 0,
          uniqueClicks: 0,
          clickHistory: [],
          topCountries: [],
          topBrowsers: [],
          dailyClicks: [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      // Fallback to empty data
      setAnalytics({
        totalClicks: 0,
        uniqueClicks: 0,
        clickHistory: [],
        topCountries: [],
        topBrowsers: [],
        dailyClicks: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const getBrowserIcon = (browser: string) => {
    switch (browser.toLowerCase()) {
      case "chrome":
        return <FaChrome className="w-4 h-4 text-blue-500" />;
      case "firefox":
        return <FaFirefox className="w-4 h-4 text-orange-500" />;
      case "safari":
        return <FaSafari className="w-4 h-4 text-blue-400" />;
      case "edge":
        return <FaEdge className="w-4 h-4 text-blue-600" />;
      default:
        return <FiGlobe className="w-4 h-4 text-gray-500" />;
    }
  };

  const handlePreferenceChange = async (
    key: string,
    value: string | number | boolean
  ) => {
    setUserPreferences((prev) => ({ ...prev, [key]: value }));
    // In real app, would save to backend
    console.log(`Updated ${key} to ${value}`);
  };

  if (activeTab === "Statistics") {
    return (
      <div
        className={`h-full rounded-xl border p-6 overflow-y-auto ${
          theme === "light"
            ? "bg-white border-gray-200"
            : theme === "dark"
            ? "bg-[#1a1a1a] border-gray-700"
            : "bg-[#23263A] border-[#35384a]"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`p-3 rounded-xl ${
              theme === "light"
                ? "bg-blue-100 text-blue-600"
                : "bg-blue-500/20 text-blue-400"
            }`}
          >
            <FiTrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3
              className={`text-xl font-semibold ${
                theme === "light" ? "text-gray-900" : "text-[#E5E7EB]"
              }`}
            >
              Analytics Dashboard
            </h3>
            <p
              className={`text-sm ${
                theme === "light" ? "text-gray-600" : "text-[#A1A8B3]"
              }`}
            >
              Track your URL performance and audience insights
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border ${
                  theme === "light"
                    ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                    : "bg-gradient-to-br from-blue-500/10 to-blue-600/20 border-blue-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiEye className="w-5 h-5 text-blue-500" />
                  <span
                    className={`text-sm font-medium ${
                      theme === "light" ? "text-blue-700" : "text-blue-400"
                    }`}
                  >
                    Total Clicks
                  </span>
                </div>
                <p
                  className={`text-2xl font-bold mt-2 ${
                    theme === "light" ? "text-blue-900" : "text-blue-300"
                  }`}
                >
                  {analytics.totalClicks.toLocaleString()}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`p-4 rounded-xl border ${
                  theme === "light"
                    ? "bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                    : "bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiActivity className="w-5 h-5 text-green-500" />
                  <span
                    className={`text-sm font-medium ${
                      theme === "light" ? "text-green-700" : "text-green-400"
                    }`}
                  >
                    Unique Clicks
                  </span>
                </div>
                <p
                  className={`text-2xl font-bold mt-2 ${
                    theme === "light" ? "text-green-900" : "text-green-300"
                  }`}
                >
                  {analytics.uniqueClicks.toLocaleString()}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`p-4 rounded-xl border ${
                  theme === "light"
                    ? "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
                    : "bg-gradient-to-br from-purple-500/10 to-purple-600/20 border-purple-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiBarChart className="w-5 h-5 text-purple-500" />
                  <span
                    className={`text-sm font-medium ${
                      theme === "light" ? "text-purple-700" : "text-purple-400"
                    }`}
                  >
                    Click Rate
                  </span>
                </div>
                <p
                  className={`text-2xl font-bold mt-2 ${
                    theme === "light" ? "text-purple-900" : "text-purple-300"
                  }`}
                >
                  {(
                    (analytics.uniqueClicks / analytics.totalClicks) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`p-4 rounded-xl border ${
                  theme === "light"
                    ? "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
                    : "bg-gradient-to-br from-orange-500/10 to-orange-600/20 border-orange-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiGlobe className="w-5 h-5 text-orange-500" />
                  <span
                    className={`text-sm font-medium ${
                      theme === "light" ? "text-orange-700" : "text-orange-400"
                    }`}
                  >
                    Countries
                  </span>
                </div>
                <p
                  className={`text-2xl font-bold mt-2 ${
                    theme === "light" ? "text-orange-900" : "text-orange-300"
                  }`}
                >
                  {analytics.topCountries.length}
                </p>
              </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Countries */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`p-6 rounded-xl border ${
                  theme === "light"
                    ? "bg-white border-gray-200"
                    : theme === "dark"
                    ? "bg-[#1a1a1a] border-gray-700"
                    : "bg-[#181B23] border-[#35384a]"
                }`}
              >
                <h4
                  className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    theme === "light" ? "text-gray-900" : "text-[#E5E7EB]"
                  }`}
                >
                  <FiGlobe className="w-5 h-5" />
                  Top Countries
                </h4>
                <div className="space-y-3">
                  {analytics.topCountries.map((country, index) => (
                    <div
                      key={country.country}
                      className="flex items-center justify-between"
                    >
                      <span
                        className={`text-sm ${
                          theme === "light" ? "text-gray-700" : "text-[#A1A8B3]"
                        }`}
                      >
                        {country.country}
                      </span>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500`}
                          style={{
                            width: `${
                              (country.clicks /
                                analytics.topCountries[0].clicks) *
                              100
                            }px`,
                          }}
                        ></div>
                        <span
                          className={`text-sm font-medium ${
                            theme === "light"
                              ? "text-gray-900"
                              : "text-[#E5E7EB]"
                          }`}
                        >
                          {country.clicks.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Top Browsers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`p-6 rounded-xl border ${
                  theme === "light"
                    ? "bg-white border-gray-200"
                    : theme === "dark"
                    ? "bg-[#1a1a1a] border-gray-700"
                    : "bg-[#181B23] border-[#35384a]"
                }`}
              >
                <h4
                  className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    theme === "light" ? "text-gray-900" : "text-[#E5E7EB]"
                  }`}
                >
                  <FiPieChart className="w-5 h-5" />
                  Top Browsers
                </h4>
                <div className="space-y-3">
                  {analytics.topBrowsers.map((browser, index) => (
                    <div
                      key={browser.browser}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {getBrowserIcon(browser.browser)}
                        <span
                          className={`text-sm ${
                            theme === "light"
                              ? "text-gray-700"
                              : "text-[#A1A8B3]"
                          }`}
                        >
                          {browser.browser}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500`}
                          style={{
                            width: `${
                              (browser.clicks /
                                analytics.topBrowsers[0].clicks) *
                              100
                            }px`,
                          }}
                        ></div>
                        <span
                          className={`text-sm font-medium ${
                            theme === "light"
                              ? "text-gray-900"
                              : "text-[#E5E7EB]"
                          }`}
                        >
                          {browser.clicks.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "Click Stream") {
    return (
      <div
        className={`h-111.5 rounded-xl border p-6 flex flex-col ${
          theme === "light"
            ? "bg-white border-gray-200"
            : theme === "dark"
            ? "bg-[#1a1a1a] border-gray-700"
            : "bg-[#23263A] border-[#35384a]"
        }`}
      >
        {/* Sticky Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`p-3 rounded-xl ${
              theme === "light"
                ? "bg-green-100 text-green-600"
                : "bg-green-500/20 text-green-400"
            }`}
          >
            <FiLink className="w-6 h-6" />
          </div>
          <div>
            <h3
              className={`text-xl font-semibold ${
                theme === "light" ? "text-gray-900" : "text-[#E5E7EB]"
              }`}
            >
              Real-time Click Stream
            </h3>
            <p
              className={`text-sm ${
                theme === "light" ? "text-gray-600" : "text-[#A1A8B3]"
              }`}
            >
              Live feed of clicks on your shortened URLs
            </p>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
          <div className="space-y-4 pr-2">
            {/* Live indicator */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span
                className={`text-sm font-medium ${
                  theme === "light" ? "text-green-700" : "text-green-400"
                }`}
              >
                Live Stream Active {loading && "• Refreshing..."}
              </span>
            </div>

            {/* Click stream */}
            <div className="space-y-3">
              {analytics.clickHistory.map((click, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    theme === "light"
                      ? "bg-gray-50 border-gray-200"
                      : theme === "dark"
                      ? "bg-[#1a1a1a] border-gray-700"
                      : "bg-[#181B23] border-[#35384a]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          index === 0 ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            theme === "light"
                              ? "text-gray-900"
                              : "text-[#E5E7EB]"
                          }`}
                        >
                          Click from {click.country}
                        </p>
                        <p
                          className={`text-xs ${
                            theme === "light"
                              ? "text-gray-600"
                              : "text-[#A1A8B3]"
                          }`}
                        >
                          {click.browser} • {click.ip}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xs ${
                          theme === "light" ? "text-gray-600" : "text-[#A1A8B3]"
                        }`}
                      >
                        {new Date(click.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty state */}
            {analytics.clickHistory.length === 0 && (
              <div
                className={`text-center py-12 ${
                  theme === "light" ? "text-gray-500" : "text-[#A1A8B3]"
                }`}
              >
                <FiActivity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>
                  No recent clicks. Share your URLs to see real-time activity!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  {
    /* Settings*/
  }
  if (activeTab === "Settings") {
    return (
      <div
        className={`h-full rounded-xl border p-6 overflow-y-auto ${
          theme === "light"
            ? "bg-white border-gray-200"
            : theme === "dark"
            ? "bg-[#1a1a1a] border-gray-700"
            : "bg-[#23263A] border-[#35384a]"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`p-3 rounded-xl ${
              theme === "light"
                ? "bg-purple-100 text-purple-600"
                : "bg-purple-500/20 text-purple-400"
            }`}
          >
            <FiSettings className="w-6 h-6" />
          </div>
          <div>
            <h3
              className={`text-xl font-semibold ${
                theme === "light" ? "text-gray-900" : "text-[#E5E7EB]"
              }`}
            >
              Preferences
            </h3>
            <p
              className={`text-sm ${
                theme === "light" ? "text-gray-600" : "text-[#A1A8B3]"
              }`}
            >
              Minimal settings for demo – stored locally only
            </p>
          </div>
        </div>

        <div className="space-y-6 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-xl border ${
              theme === "light"
                ? "bg-white border-gray-200"
                : theme === "dark"
                ? "bg-[#1a1a1a] border-gray-700"
                : "bg-[#181B23] border-[#35384a]"
            }`}
          >
            <h4
              className={`text-lg font-semibold mb-4 ${
                theme === "light" ? "text-gray-900" : "text-[#E5E7EB]"
              }`}
            >
              Default URL Expiry
            </h4>
            <div className="space-y-3">
              <select
                value={defaultExpiryMinutes}
                onChange={(e) =>
                  onChangeDefaultExpiry?.(parseInt(e.target.value))
                }
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  theme === "light"
                    ? "bg-white border-gray-300 text-gray-900"
                    : theme === "dark"
                    ? "bg-[#1a1a1a] border-gray-600 text-white"
                    : "bg-[#181B23] border-[#35384a] text-white"
                }`}
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={1440}>24 hours</option>
                <option value={10080}>7 days</option>
                <option value={43200}>30 days</option>
              </select>
              <p
                className={`text-xs ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Applied automatically when you create a new short link.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`p-6 rounded-xl border flex items-center justify-between ${
              theme === "light"
                ? "bg-white border-gray-200"
                : theme === "dark"
                ? "bg-[#1a1a1a] border-gray-700"
                : "bg-[#181B23] border-[#35384a]"
            }`}
          >
            <div>
              <p
                className={`text-sm font-medium ${
                  theme === "light" ? "text-gray-900" : "text-[#E5E7EB]"
                }`}
              >
                Quick Copy
              </p>
              <p
                className={`text-xs ${
                  theme === "light" ? "text-gray-600" : "text-[#A1A8B3]"
                }`}
              >
                Automatically copies each new short link to clipboard.
              </p>
            </div>
            <button
              onClick={onToggleQuickCopy}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                quickCopy
                  ? theme === "light"
                    ? "bg-blue-500"
                    : "bg-gradient-to-r from-[#4F8CFF] to-[#E052CB]"
                  : theme === "light"
                  ? "bg-gray-300"
                  : "bg-[#23263a] border border-[#35384a]"
              }`}
            >
              <span
                className={`h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-300 ${
                  quickCopy ? "translate-x-6" : ""
                }`}
              />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}
