import { Url } from "../models/url.model.js";
import User from "../models/user.model.js";
import { Log } from "../utils/httpLogger.js";
import { nanoid } from "nanoid";
import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export const createShortUrl = asyncHandler(async (req, res) => {
  const { url, validity, shortcode } = req.body;

  if (!url) {
    await Log(
      "backend",
      "warn",
      "controller",
      "URL creation failed: Missing URL"
    );
    throw new ApiError(400, "Url is required");
  }

  if (!isValidUrl(url)) {
    await Log(
      "backend",
      "warn",
      "controller",
      "URL creation failed: Invalid URL format"
    );
    throw new ApiError(400, "Invalid URL format");
  }

  // Associate with user if authenticated
  const userId = req.user?._id || null;

  let finalShortCode = shortcode?.trim() || nanoid(6);
  const existing = await Url.findOne({ shortCode: finalShortCode });
  if (existing) {
    await Log("backend", "warn", "controller", "Shortcode already in use");
    throw new ApiError(400, "Shortcode already in use. Try another one");
  }

  const newUrl = new Url({
    originalUrl: url,
    shortCode: finalShortCode,
    validityMinutes: validity || 30,
    userId: userId,
  });

  await newUrl.save();

  // Update user's URL count if authenticated
  if (userId) {
    await User.findByIdAndUpdate(userId, { $inc: { urlsCreated: 1 } });
  }

  const shortLink = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/shorturls/${finalShortCode}`;
  const expiry = newUrl.getExpiryDate();

  await Log("backend", "info", "controller", `Short URL created: ${shortLink}`);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { shortLink, expiry },
        "Short URL created successfully"
      )
    );
});

// Redirect controller
export const redirectToOriginalUrl = asyncHandler(async (req, res) => {
  const { shortcode } = req.params;

  const urlEntry = await Url.findOne({ shortCode: shortcode });

  if (!urlEntry) {
    await Log(
      "backend",
      "warn",
      "controller",
      `Redirect failed: ${shortcode} not found`
    );

    // Send HTML error page instead of JSON
    const errorPagePath = path.join(__dirname, "../views/not-found-url.html");
    return res.status(404).sendFile(errorPagePath);
  }

  const isExpired = urlEntry.isExpired();

  if (isExpired) {
    await Log(
      "backend",
      "warn",
      "controller",
      `Redirect failed: ${shortcode} has expired`
    );

    // Send HTML error page instead of JSON
    const errorPagePath = path.join(__dirname, "../views/expired-url.html");
    return res
      .status(410)
      .set("Cache-Control", "no-cache, no-store, must-revalidate")
      .set("Pragma", "no-cache")
      .set("Expires", "0")
      .sendFile(errorPagePath);
  }

  // Check if URL is active
  if (!urlEntry.isActive) {
    await Log(
      "backend",
      "warn",
      "controller",
      `Redirect failed: ${shortcode} is inactive`
    );

    // Send HTML error page instead of JSON
    const errorPagePath = path.join(__dirname, "../views/inactive-url.html");
    return res
      .status(410)
      .set("Cache-Control", "no-cache, no-store, must-revalidate")
      .set("Pragma", "no-cache")
      .set("Expires", "0")
      .sendFile(errorPagePath);
  }

  // Enhanced click tracking with real geolocation and browser detection
  const userAgent = req.get("User-Agent") || "unknown";

  // Get client IP with proper handling for proxies and localhost
  const forwarded = req.get("X-Forwarded-For") || req.get("X-Real-IP");
  let clientIP =
    (typeof forwarded === "string" && forwarded.split(",")[0].trim()) ||
    req.ip ||
    req.socket?.remoteAddress ||
    "unknown";

  // Replace localhost IP with a sample IP only in development to enrich geo data
  if (
    (clientIP === "::1" ||
      clientIP === "::ffff:127.0.0.1" ||
      clientIP === "127.0.0.1") &&
    process.env.NODE_ENV !== "production"
  ) {
    clientIP = "49.36.83.154"; // Sample Indian IP for local testing (Mumbai)
  }

  // Parse browser information
  const parser = new UAParser(userAgent);
  const browserInfo = parser.getResult();

  // Get real geolocation data
  const geoData = geoip.lookup(clientIP);
  let country = "Unknown";
  let city = "Unknown";

  if (geoData) {
    country = geoData.country || "Unknown";
    city = geoData.city || "Unknown";
  } else {
    // Fallback for local testing - assume India since you're from there
    country = "IN";
    city = "Mumbai";
  }

  urlEntry.clicks += 1;
  urlEntry.clickHistory.push({
    timestamp: new Date(),
    source: userAgent,
    location: clientIP,
    country: country,
    city: city,
    browser: browserInfo.browser.name || "Unknown",
    browserVersion: browserInfo.browser.version || "Unknown",
    os: browserInfo.os.name || "Unknown",
    device: browserInfo.device.type || "Desktop",
  });

  await urlEntry.save();

  await Log(
    "backend",
    "info",
    "controller",
    `Redirected to original URL for ${shortcode}`
  );

  return res.redirect(urlEntry.originalUrl);
});

export const getUrlStats = asyncHandler(async (req, res) => {
  const { shortcode } = req.params;

  await Log(
    "backend",
    "info",
    "controller",
    `Fetching stats for shortcode: ${shortcode}`
  );

  const urlEntry = await Url.findOne({ shortCode: shortcode });

  if (!urlEntry) {
    await Log(
      "backend",
      "warn",
      "controller",
      `Shortcode not found: ${shortcode}`
    );
    throw new ApiError(400, "Short URL not found");
  }

  const isExpired = urlEntry.isExpired();

  const stats = {
    originalUrl: urlEntry.originalUrl,
    shortCode: urlEntry.shortCode,
    totalClicks: urlEntry.clicks,
    createdAt: urlEntry.createdAt,
    expiryAt: urlEntry.getExpiryDate(),
    isExpired,
    clicksData: urlEntry.clickHistory.map((click) => ({
      timestamp: click.timestamp.toISOString(),
      source: click.source,
      location: click.location,
    })),
  };

  await Log(
    "backend",
    "info",
    "controller",
    `Stats returned for shortcode: ${shortcode}`
  );

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "URL Statistics retrieved successfully"));
});

// Get all URLs for authenticated user
export const getUserUrls = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const userId = req.user?._id;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;

  // Build query
  let query = { userId: userId };
  if (status === "active") {
    query.isActive = true;
  } else if (status === "inactive") {
    query.isActive = false;
  }

  const urls = await Url.find(query)
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .skip((pageNum - 1) * limitNum);

  const total = await Url.countDocuments(query);

  // Format URLs for frontend
  const formattedUrls = urls.map((url) => ({
    id: url._id,
    shortCode: url.shortCode,
    originalUrl: url.originalUrl,
    shortLink: `${req.protocol}://${req.get("host")}/api/v1/shorturls/${
      url.shortCode
    }`,
    clicks: url.clicks,
    status: url.isActive && !url.isExpired() ? "Active" : "Inactive",
    isExpired: url.isExpired(),
    createdAt: url.createdAt,
    expiryAt: url.getExpiryDate(),
    validityMinutes: url.validityMinutes,
  }));

  await Log(
    "backend",
    "info",
    "controller",
    `Retrieved ${formattedUrls.length} URLs for user ${userId}`
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        urls: formattedUrls,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUrls: total,
          limit: parseInt(limit),
        },
      },
      "URLs retrieved successfully"
    )
  );
});

// Toggle URL active status
export const toggleUrlStatus = asyncHandler(async (req, res) => {
  const { shortcode } = req.params;
  const userId = req.user?._id;

  const urlEntry = await Url.findOne({ shortCode: shortcode, userId });

  if (!urlEntry) {
    await Log(
      "backend",
      "warn",
      "controller",
      `Toggle status failed: URL ${shortcode} not found for user ${userId}`
    );
    throw new ApiError(
      404,
      "URL not found or you don't have permission to modify it"
    );
  }

  urlEntry.isActive = !urlEntry.isActive;
  await urlEntry.save();

  await Log(
    "backend",
    "info",
    "controller",
    `URL ${shortcode} status toggled to ${
      urlEntry.isActive ? "active" : "inactive"
    }`
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        shortCode: urlEntry.shortCode,
        isActive: urlEntry.isActive,
        status:
          urlEntry.isActive && !urlEntry.isExpired() ? "Active" : "Inactive",
      },
      `URL ${urlEntry.isActive ? "activated" : "deactivated"} successfully`
    )
  );
});

// Delete URL
export const deleteUrl = asyncHandler(async (req, res) => {
  const { shortcode } = req.params;
  const userId = req.user?._id;

  const urlEntry = await Url.findOneAndDelete({
    shortCode: shortcode,
    userId,
  });

  if (!urlEntry) {
    await Log(
      "backend",
      "warn",
      "controller",
      `Delete failed: URL ${shortcode} not found for user ${userId}`
    );
    throw new ApiError(
      404,
      "URL not found or you don't have permission to delete it"
    );
  }

  // Decrease user's URL count
  await User.findByIdAndUpdate(userId, { $inc: { urlsCreated: -1 } });

  await Log(
    "backend",
    "info",
    "controller",
    `URL ${shortcode} deleted successfully`
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "URL deleted successfully"));
});

// Update URL (edit originalUrl or validity)
export const updateUrl = asyncHandler(async (req, res) => {
  const { shortcode } = req.params;
  const { originalUrl, validityMinutes } = req.body;
  const userId = req.user?._id;

  const urlEntry = await Url.findOne({ shortCode: shortcode, userId });
  if (!urlEntry) {
    throw new ApiError(404, "URL not found or no permission");
  }

  if (originalUrl) {
    if (!isValidUrl(originalUrl)) {
      throw new ApiError(400, "Invalid URL format");
    }
    urlEntry.originalUrl = originalUrl;
  }

  if (validityMinutes !== undefined) {
    urlEntry.validityMinutes = validityMinutes;
  }

  await urlEntry.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        shortCode: urlEntry.shortCode,
        originalUrl: urlEntry.originalUrl,
      },
      "URL updated successfully"
    )
  );
});

// Bulk delete URLs by shortCodes
export const bulkDeleteUrls = asyncHandler(async (req, res) => {
  const { shortCodes } = req.body; // expect array
  const userId = req.user?._id;

  if (!Array.isArray(shortCodes) || shortCodes.length === 0) {
    throw new ApiError(400, "shortCodes array required");
  }

  const result = await Url.deleteMany({
    shortCode: { $in: shortCodes },
    userId,
  });

  // decrement user's urlsCreated by deleted count
  if (result.deletedCount && result.deletedCount > 0) {
    await User.findByIdAndUpdate(userId, {
      $inc: { urlsCreated: -result.deletedCount },
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deleted: result.deletedCount },
        "Bulk delete completed"
      )
    );
});

// Bulk toggle status (activate/deactivate) for multiple shortCodes
export const bulkToggleUrls = asyncHandler(async (req, res) => {
  const { shortCodes, makeActive } = req.body; // expect array and boolean
  const userId = req.user?._id;

  if (!Array.isArray(shortCodes) || shortCodes.length === 0) {
    throw new ApiError(400, "shortCodes array required");
  }

  const update = { isActive: !!makeActive };

  const result = await Url.updateMany(
    { shortCode: { $in: shortCodes }, userId },
    { $set: update }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { modified: result.modifiedCount },
        "Bulk toggle completed"
      )
    );
});

// Get real analytics data for user
export const getUserAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Authentication required");
  }

  const urls = await Url.find({ userId });

  // Calculate real analytics
  let totalClicks = 0;
  let uniqueClicks = 0;
  const countryStats = {};
  const browserStats = {};
  const dailyStats = {};
  const allClicks = [];

  urls.forEach((url) => {
    totalClicks += url.clicks;

    // Process click history for detailed analytics
    url.clickHistory.forEach((click) => {
      // Country stats
      const country = click.country || "Unknown";
      countryStats[country] = (countryStats[country] || 0) + 1;

      // Browser stats
      const browser = click.browser || "Unknown";
      browserStats[browser] = (browserStats[browser] || 0) + 1;

      // Daily stats
      const date = click.timestamp.toISOString().split("T")[0];
      dailyStats[date] = (dailyStats[date] || 0) + 1;

      // For recent clicks sorting later
      allClicks.push(click);
    });
  });

  // Sort and format data
  const topCountries = Object.entries(countryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([country, clicks]) => ({ country, clicks }));

  const topBrowsers = Object.entries(browserStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([browser, clicks]) => ({ browser, clicks }));

  const dailyClicks = Object.entries(dailyStats)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .slice(-7) // Last 7 days
    .map(([date, clicks]) => ({ date, clicks }));

  // Calculate unique clicks (approximate - by unique IPs)
  const uniqueIPs = new Set();
  urls.forEach((url) => {
    url.clickHistory.forEach((click) => {
      uniqueIPs.add(click.location);
    });
  });
  uniqueClicks = uniqueIPs.size;

  // Compute recent clicks (last 10 by timestamp desc)
  allClicks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const recentClicks = allClicks.slice(0, 10).map((click) => ({
    timestamp: click.timestamp,
    country: click.country,
    city: click.city,
    browser: click.browser,
    ip: click.location,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalClicks,
        uniqueClicks,
        topCountries,
        topBrowsers,
        dailyClicks,
        recentClicks,
        urlCount: urls.length,
      },
      "Analytics data retrieved successfully"
    )
  );
});

// Reset analytics data for a user
export const resetUserAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Authentication required");
  }

  // Reset all click data for user's URLs
  const result = await Url.updateMany(
    { userId: userId },
    {
      $set: {
        clicks: 0,
        clickHistory: [],
      },
    }
  );

  await Log(
    "backend",
    "info",
    "controller",
    `Analytics reset for user ${userId}. Updated ${result.modifiedCount} URLs`
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        urlsUpdated: result.modifiedCount,
      },
      `Analytics data reset successfully. ${result.modifiedCount} URLs updated.`
    )
  );
});

// Reset analytics data for all URLs (admin function)
export const resetAllAnalytics = asyncHandler(async (req, res) => {
  // Reset all click data for all URLs
  const result = await Url.updateMany(
    {},
    {
      $set: {
        clicks: 0,
        clickHistory: [],
      },
    }
  );

  await Log(
    "backend",
    "info",
    "controller",
    `All analytics reset. Updated ${result.modifiedCount} URLs`
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        urlsUpdated: result.modifiedCount,
      },
      `All analytics data reset successfully. ${result.modifiedCount} URLs updated.`
    )
  );
});
