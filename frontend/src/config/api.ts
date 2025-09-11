// Configuration for API endpoints
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
  API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1",
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string) => {
  return `${API_CONFIG.API_BASE_URL}${
    endpoint.startsWith("/") ? endpoint : "/" + endpoint
  }`;
};

// Helper function to build short URL for QR codes and sharing
export const buildShortUrl = (shortCode: string) => {
  return `${API_CONFIG.BASE_URL}/api/v1/shorturls/${shortCode}`;
};
