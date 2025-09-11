# URL Shortener Backend

This is the backend service for the URL Shortener and Analytics application. It is built with **Node.js**, **Express**, and **MongoDB** (via Mongoose), and provides RESTful APIs for creating, managing, and analyzing short URLs. The backend also integrates a custom logging middleware for robust observability.

---

## Features

- **Short URL Creation:**  
  Generate short URLs for any valid long URL, with optional custom shortcode and configurable validity period (in minutes).

- **Short URL Analytics:**  
  Track total clicks, click history (timestamp, source, location), and expiry status for each short URL.

- **Custom Shortcodes:**  
  Users can specify a custom shortcode, or the system will generate a unique one.

- **URL Expiry:**  
  Each short URL can have a custom validity period. Expired URLs are automatically detected.

- **Logging Middleware:**  
  All requests and key events are logged using a reusable logging middleware, which sends logs to a centralized logging server.

- **Health Check Endpoint:**  
  Simple endpoint to verify the backend service is running.

---

## API Endpoints

### 1. Create Short URL

- **POST** `/shorturls`
- **Body:**  
  ```json
  {
    "url": "https://example.com/long-url",
    "validity": 30,                // (optional, minutes, default: 30)
    "shortcode": "custom123"        // (optional)
  }
  ```
- **Response:**  
  ```json
  {
    "success": true,
    "data": {
      "shortLink": "http://hostname:port/custom123",
      "expiry": "2025-07-18T12:34:56.000Z"
    },
    "message": "Short URL created successfully"
  }
  ```

### 2. Get URL Statistics

- **GET** `/shorturls/:shortcode`
- **Response:**  
  ```json
  {
    "success": true,
    "data": {
      "originalUrl": "...",
      "shortCode": "...",
      "totalClicks": 0,
      "createdAt": "...",
      "expiryDate": "...",
      "isExpired": false,
      "clickData": [
        {
          "timestamp": "...",
          "source": "...",
          "location": "..."
        }
      ]
    },
    "message": "Statistics retrieved successfully"
  }
  ```

### 3. Health Check

- **GET** `/health`
- **Response:**  
  ```json
  {
    "success": true,
    "message": "URL Shortener service is running",
    "timestamp": "..."
  }
  ```

---

## Code Structure

- `src/app.js`  
  Main Express app setup, middleware, routes, and error handling.

- `src/index.js`  
  Entry point: loads environment, connects to MongoDB, starts the server.

- `src/routes/url.routes.js`  
  Defines API routes for short URL creation and statistics.

- `src/controllers/url.controller.js`  
  Business logic for creating short URLs, validating input, generating shortcodes, and fetching analytics.

- `src/models/url.model.js`  
  Mongoose schema for URLs, including click tracking, expiry logic, and methods for analytics.

- `src/db/DB.js`  
  MongoDB connection logic.

- `src/constant.js`  
  Database name constant.

- **Logging Middleware:**  
  Integrated from `Logging-middleware/`, logs all requests and errors to a central server.

---

## Logging

- All incoming requests and key events are logged using the custom middleware.
- Logs are sent to a centralized logging server (see `Logging-middleware/`).
- Log format:  
  ```
  Log(stack, level, package, message)
  ```
  Example:
  ```
  Log("backend", "info", "controller", "Creating new short URL")
  ```

---

## Error Handling

- All errors are logged and return a consistent JSON error response.
- Unhandled errors are caught by a global error handler.

---

## Environment Variables

- `MONGO_DB_URI` — MongoDB connection string
- `PORT` — Port for the backend server (default: 6000)

---

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**  
   Create a `.env` file in the backend directory with:
   ```
   MONGO_DB_URI=mongodb://localhost:27017
   PORT=6000
   ```

3. **Run the backend server:**
   ```bash
   npm run dev
   ```

4. **The API will be available at:**  
   [http://localhost:6000](http://localhost:6000)

---

## Tech Stack

- **Node.js** + **Express** (API server)
- **MongoDB** + **Mongoose** (database & schema)
- **Custom Logging Middleware** (for observability)
- **CORS** enabled for frontend integration

---

## Contributing

Pull requests and suggestions are welcome! Please open an issue or PR for improvements or bug fixes.

---

© 2025 URL Shortener Backend — Built with Node.js, Express, and MongoDB
