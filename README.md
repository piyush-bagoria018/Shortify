# 🚀 Shortify - URL Shortening Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.0-blue?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

A modern URL shortening platform built with Next.js 15 and Node.js. Features include URL analytics, QR code generation, and a beautiful glass morphism UI with multiple theme support.

## 🌟 Features

### 🎯 **Core Functionality**

- **URL Shortening** - Convert long URLs into short, shareable links
- **QR Code Generation** - Generate QR codes with download functionality
- **Link Analytics** - Click tracking with geographic data
- **Bulk Operations** - Manage multiple URLs at once
- **Website Icons** - Auto-detection of platform icons (GitHub, YouTube, etc.)

### 🎨 **User Interface**

- **Glass Morphism Design** - Modern UI with blur effects and gradients
- **Multiple Themes** - Glass (default), Light, and Dark theme variants
- **Responsive Design** - Works on desktop and mobile devices
- **Smooth Animations** - Framer Motion transitions
- **Auto Paste** - Smart clipboard detection for quick URL input

### 🔐 **Authentication**

- **User Registration** - Account creation with email verification
- **JWT Authentication** - Secure user sessions
- **Password Reset** - Forgot password with OTP verification using Resend
- **Protected Routes** - User-specific URL management

## � Live Demo

- **Frontend**: [https://shortify-7l1m.vercel.app](https://shortify-7l1m.vercel.app)
- **API Backend**: [https://shortify-qiu9.onrender.com](https://shortify-qiu9.onrender.com)

### 🎯 Try These Features:

- ✅ **URL Shortening** - Paste any long URL and get instant short link
- ✅ **Real-time Analytics** - Watch click statistics update live
- ✅ **QR Code Generation** - Generate and download QR codes
- ✅ **Theme Switching** - Try Glass, Light, and Dark themes

## 💻 Tech Stack

### Frontend

- **Framework**: Next.js 15 with App Router (Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + Custom CSS
- **Animations**: Framer Motion 12
- **State Management**: React Hooks + Context
- **Icons**: React Icons (Heroicons, React Icons)
- **QR Code**: qrcode library
- **Theme Support**: next-themes (Glass/Light/Dark)
- **Particles**: tsparticles (background effects)

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **Email Service**: Resend (for password reset emails)
- **Geographic Data**: geoip-lite (for click location tracking)
- **Logging**: Custom HTTP-based logging middleware

### Deployment

- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: MongoDB Atlas
- **Version Control**: Git & GitHub

## 📦 Installation & Setup

### Prerequisites

- Node.js 18.0 or higher
- MongoDB Atlas account or local MongoDB
- Git

### 1. Clone Repository

```bash
git clone https://github.com/piyush-bagoria018/Shortify.git
cd Shortify
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables in .env
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
# Update API endpoints in src/config/api.ts
npm run dev
```

### 4. Environment Variables

#### Backend (.env)

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/shortify
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Resend Email Service Configuration
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@shortify.com
FROM_NAME=Shortify

# Application URLs
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Logging Service (Optional)
LOGGING_SERVICE_URL=https://logging-middleware-iub8.onrender.com
```

#### Frontend (next.config.ts)

```typescript
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🔧 Development

### Available Scripts

#### Frontend

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

#### Backend

```bash
npm run dev          # Start with nodemon
npm run start        # Start production server
```

### Project Structure

```
afford-medical/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   └── url.controller.js
│   │   ├── middleware/      # Custom middleware
│   │   │   └── auth.middleware.js
│   │   ├── models/         # Database models
│   │   │   ├── user.model.js
│   │   │   └── url.model.js
│   │   ├── routes/         # API routes
│   │   │   ├── auth.routes.js
│   │   │   └── url.routes.js
│   │   ├── services/       # Business logic
│   │   │   ├── email.service.js
│   │   │   └── otp.service.js
│   │   ├── db/            # Database connection
│   │   │   └── DB.js
│   │   ├── app.js         # Express app setup
│   │   ├── index.js       # Server entry point
│   │   └── constant.js    # App constants
│   └── package.json
│
├── frontend/               # Next.js React app
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   │   ├── dashboard/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── components/    # Reusable components
│   │   │   ├── Header.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── UrlForm.tsx
│   │   │   ├── DashboardTabs.tsx
│   │   │   └── UrlTable.tsx
│   │   ├── utils/         # Helper functions
│   │   │   └── websiteIcons.tsx
│   │   └── config/        # Configuration files
│   ├── public/            # Static assets
│   └── package.json
│
├── Logging-middleware/     # Centralized logging service
│   ├── middleware/
│   │   └── middleware.js
│   ├── utils/
│   │   └── logger.js
│   ├── app.js
│   ├── index.js
│   ├── logs.json
│   └── package.json
│
├── screenshots/           # App screenshots
└── README.md             # This file
```

## 📱 Screenshots

### 🏠 Landing Page

_Modern landing page with beautiful gradient design and smooth animations_

![Landing Page](./screenshots/home%20page.png)

### 📊 Dashboard - URL History

_Advanced URL management with real-time status tracking and bulk operations_

![Dashboard History](./screenshots/history.png)

### 📈 Analytics Dashboard

_Comprehensive analytics with click tracking, geographic data, and browser insights_

![Analytics Dashboard](./screenshots/stats.png)

### 🎯 Real-time Click Stream

_Live feed of URL clicks with geographic and browser information_

![Click Stream](./screenshots/click%20stream.png)

### Authentication Pages

_Beautiful login, registration, and forgot password forms with animated backgrounds_

<div align="center">
  <img src="./screenshots/login%20oage.png" alt="Login Page" width="280"/>
  <img src="./screenshots/register%20page.png" alt="Register Page" width="280"/>
  <img src="./screenshots/foget-password.png" alt="Forgot Password Page" width="280"/>
</div>

### 📱 QR Code Generation

_Instant QR code generation with download functionality_

![QR Code Modal](./screenshots/qr%20code.png)

### 🔍 Live Logs Monitoring

_Real-time logging system with centralized monitoring dashboard_

![Live Logs Viewer](./screenshots/logs-viewer.png)

### 🎨 Theme Variations

_Multiple theme support: Glassmorphism (default), Light, and Dark Pro themes_

<div align="center">
  <img src="./screenshots/glass%20theme.png" alt="Glass Theme" width="280"/>
  <img src="./screenshots/light%20theme.png" alt="Light Theme" width="280"/>
  <img src="./screenshots/dark%20pro%20theme.png" alt="Dark Theme" width="280"/>
</div>

## ‍💻 Author

**Piyush Bagoria**

- GitHub: [@piyush-bagoria018](https://github.com/piyush-bagoria018)
- Email: piyush.bagoria018@gmail.com

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ by [Piyush Bagoria](https://github.com/piyush-bagoria018)

</div>
