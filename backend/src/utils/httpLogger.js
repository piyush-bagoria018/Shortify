// HTTP-based logging utility for production deployment
const Log = async (service, level, module, message) => {
  try {
    const loggingUrl =
      process.env.LOGGING_SERVICE_URL ||
      "https://logging-middleware-iub8.onrender.com";

    const response = await fetch(`${loggingUrl}/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service,
        level,
        module,
        message,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error("Logging service error:", response.status);
    }
  } catch (error) {
    // Fallback to console logging if HTTP logging fails
    console.error("Logging failed, falling back to console:", error.message);
    console.log(`[${service}] [${level}] [${module}] ${message}`);
  }
};

// Middleware function placeholder (not needed for HTTP logging)
const logMiddleware = (req, res, next) => {
  // Optional: Log HTTP requests
  Log("backend", "info", "middleware", `${req.method} ${req.path}`);
  next();
};

export { Log, logMiddleware };
