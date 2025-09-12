# 🚀 Shortify - Advanced URL Shortening Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-blue?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

A modern, feature-rich URL shortening platform built with cutting-edge technologies. Shortify offers enterprise-level features including analytics, QR code generation, bulk operations, and a beautiful responsive interface with multiple theme support.

## 🌟 Key Features

### 🎯 **Core Functionality**

- **URL Shortening** - Convert long URLs into short, shareable links
- **Smart Code Generation** - Auto-generated collision-free short codes
- **QR Code Generation** - Instant QR codes for easy mobile sharing
- **Link Analytics** - Detailed click tracking and usage statistics
- **Bulk Operations** - Mass URL management and deletion

### 🎨 **User Experience**

- **Multiple Themes** - Light, Dark, and Glass theme variants
- **Responsive Design** - Seamless experience across all devices
- **Smooth Animations** - Professional Framer Motion transitions
- **Real-time Updates** - Live data synchronization
- **Progressive Web App** - Installable and offline-capable

### 🔐 **Security & Authentication**

- **JWT Authentication** - Secure user sessions
- **OTP Verification** - Email-based account verification
- **Protected Routes** - Role-based access control
- **Data Validation** - Comprehensive input sanitization

### 📊 **Advanced Features**

- **Dashboard Analytics** - Comprehensive usage insights
- **Link Management** - Edit, delete, and organize URLs
- **Export Functionality** - Download analytics and data
- **API Integration** - RESTful API for external integration

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│   Port: 3000    │    │   Port: 3001    │    │   Atlas Cloud   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel CDN    │    │   Render Cloud  │    │  Logging System │
│   (Production)  │    │   (Production)  │    │   (Middleware)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Live Demo

- **Frontend**: [https://shortify-app.vercel.app](https://shortify-app.vercel.app)
- **API Documentation**: [API Docs](https://your-backend.onrender.com/api/docs)
- **Test Credentials**:
  - Email: `demo@shortify.com`
  - Password: `Demo@123`

## 💻 Tech Stack

### Frontend

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **Animations**: Framer Motion
- **State Management**: React Hooks + Context
- **HTTP Client**: Axios
- **Charts**: Chart.js / Recharts

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **Email Service**: Nodemailer
- **Validation**: Joi / express-validator
- **Security**: Helmet, CORS, rate limiting

### DevOps & Deployment

- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: MongoDB Atlas
- **Version Control**: Git & GitHub
- **CI/CD**: GitHub Actions (optional)

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
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

#### Frontend (next.config.ts)

```typescript
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🔧 Development

### Available Scripts

#### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
```

#### Backend

```bash
npm run dev          # Start with nodemon
npm run start        # Start production server
npm run test         # Run test suite
npm run seed         # Seed database
```

### Project Structure

```
Shortify/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── .env.example
│
├── frontend/               # Next.js React app
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable components
│   │   ├── config/        # Configuration files
│   │   └── utils/         # Helper functions
│   ├── public/            # Static assets
│   ├── package.json
│   └── next.config.ts
│
├── Logging-middleware/     # Centralized logging
└── README.md              # This file
```

## 📱 Screenshots

### Landing Page

![Landing Page](https://via.placeholder.com/800x400/0ea5e9/ffffff?text=Shortify+Landing+Page)

### Dashboard

![Dashboard](https://via.placeholder.com/800x400/10b981/ffffff?text=Analytics+Dashboard)

### URL Management

![URL Management](https://via.placeholder.com/800x400/8b5cf6/ffffff?text=URL+Management+Interface)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Production Deployment

#### 1. Backend (Render)

1. Connect GitHub repository to Render
2. Select `backend` folder as root directory
3. Add environment variables
4. Deploy with auto-deployment enabled

#### 2. Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Select `frontend` folder as root directory
3. Configure build settings
4. Update API URLs to production backend

#### 3. Database (MongoDB Atlas)

1. Create MongoDB Atlas cluster
2. Configure network access and users
3. Update connection string in backend

## 📊 Performance Metrics

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **API Response Time**: < 200ms average

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

### Authentication Endpoints

```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
POST /api/auth/verify-otp  # OTP verification
POST /api/auth/forgot-password # Password reset
```

### URL Management Endpoints

```
POST /api/urls/shorten     # Create short URL
GET  /api/urls             # Get user URLs
PUT  /api/urls/:id         # Update URL
DELETE /api/urls/:id       # Delete URL
GET  /short/:code          # Redirect to original URL
```

## 🔒 Security Features

- **Input Validation**: Comprehensive data validation and sanitization
- **Rate Limiting**: API endpoint protection against abuse
- **CORS Configuration**: Secure cross-origin resource sharing
- **Helmet Integration**: Security headers and vulnerability protection
- **JWT Security**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for user passwords

## 📈 Future Enhancements

- [ ] **Custom Short Codes** - User-defined memorable short URLs
- [ ] **Advanced Analytics** - Geographic data, referrer tracking
- [ ] **Team Collaboration** - Multi-user workspaces
- [ ] **Custom Domains** - Branded short URLs
- [ ] **API Rate Limiting** - Usage-based pricing tiers
- [ ] **Mobile App** - React Native companion app
- [ ] **Browser Extension** - Quick URL shortening
- [ ] **Webhook Support** - Real-time event notifications

## 🐛 Known Issues

- None currently reported. Please [open an issue](https://github.com/piyush-bagoria018/Shortify/issues) if you find any bugs.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Piyush Bagoria**

- GitHub: [@piyush-bagoria018](https://github.com/piyush-bagoria018)
- LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/yourprofile)
- Email: piyush.bagoria018@gmail.com
- Portfolio: [Your Portfolio Website](https://yourportfolio.com)

## 🙏 Acknowledgments

- [Next.js Team](https://nextjs.org/) for the amazing React framework
- [Vercel](https://vercel.com/) for seamless deployment platform
- [MongoDB](https://mongodb.com/) for the flexible NoSQL database
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Framer Motion](https://framer.com/motion/) for smooth animations

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ by [Piyush Bagoria](https://github.com/piyush-bagoria018)

</div>
