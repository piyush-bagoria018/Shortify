import { app } from "./app.js";
import connectDB from "./db/DB.js";
import dotenv from "dotenv";
import { Log } from "./utils/httpLogger.js";

// Load environment variables
dotenv.config();

Log("backend", "info", "server", "Starting URL Shortener Microservice...");

// Connect to database and start server
connectDB()
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, "0.0.0.0", () => {
      Log(
        "backend",
        "info",
        "server",
        `Server running successfully on port ${port}`
      );
      console.log(`🚀 URL Shortener API running on http://localhost:${port}`);
      console.log(`🌐 Network access: http://192.168.0.101:${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
    });
  })
  .catch((error) => {
    Log(
      "backend",
      "fatal",
      "server",
      `Failed to start server: ${error.message}`
    );
    process.exit(1);
  });
