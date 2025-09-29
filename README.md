# Mobile Tracker Application

A comprehensive SaaS mobile tracking solution with backend API and web portal.

## 🏗️ Architecture

### Backend
- **Framework**: Node.js with Express.js
- **Database**: MySQL with Prisma ORM
- **Cache**: Redis for session management and real-time data
- **Real-time**: Socket.IO for live tracking and screen sharing
- **Security**: Rate limiting, CORS, JWT authentication
- **Logging**: Centralized async logging to file and console
- **Error Handling**: Centralized error handling middleware

### Portal (Web Dashboard)
- **Framework**: Next.js 14 with App Router
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Responsive**: Mobile-first design across all devices

## 🚀 Features

### Core Tracking Capabilities
- **Multi-device Management**: Customers can onboard multiple devices
- **Media Access**: Photos, audio, video recording
- **Communication**: Call logs, contacts, social media notifications
- **App Management**: Enable/disable applications remotely
- **Location Tracking**: Real-time GPS tracking
- **Screen Sharing**: Live screen streaming and recording
- **Audio Recording**: Background audio capture

### SaaS Features
- **Multi-tenant Architecture**: Isolated customer data
- **Subscription Management**: Billing and plan management
- **User Management**: Role-based access control
- **Analytics Dashboard**: Usage statistics and insights

## 📁 Project Structure

```
tracker/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Prisma models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration files
│   ├── prisma/              # Database schema and migrations
│   ├── logs/                # Application logs
│   └── package.json
├── portal/                  # Next.js web portal
│   ├── src/
│   │   ├── app/             # Next.js app router
│   │   ├── components/      # Reusable components
│   │   ├── store/           # Redux store
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Utility functions
│   └── package.json
├── shared/                  # Shared types and utilities
└── README.md
```

## 🛠️ Development Standards

### Code Quality
- **Clean Code**: Readable, maintainable code
- **DRY Principle**: Don't Repeat Yourself
- **SOLID Principles**: Single responsibility, open/closed, etc.
- **TypeScript**: Full type safety
- **ESLint & Prettier**: Code formatting and linting

### Architecture Patterns
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic separation
- **Middleware Pattern**: Request/response processing
- **Factory Pattern**: Object creation
- **Observer Pattern**: Event handling

### Security
- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control
- **Rate Limiting**: API request throttling
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Request data validation
- **SQL Injection Prevention**: Parameterized queries

## 📋 Change Log

### [Unreleased]
- Initial project setup
- Backend core infrastructure
- Portal foundation
- Database schema design

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Redis 6.0+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd tracker
```

2. Install dependencies
```bash
# Backend
cd backend
npm install

# Portal
cd ../portal
npm install
```

3. Set up environment variables
```bash
# Copy example files
cp backend/.env.example backend/.env
cp portal/.env.example portal/.env
```

4. Set up database
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

5. Start development servers
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Portal (Terminal 2)
cd portal
npm run dev
```

## 📝 Development Workflow

1. **Feature Development**: Create feature branches from main
2. **Code Review**: All changes require review
3. **Testing**: Write tests for new features
4. **Documentation**: Update docs for API changes
5. **Deployment**: Automated deployment pipeline

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="mysql://user:password@localhost:3306/tracker"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-jwt-secret"
```

#### Portal (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

## 📊 Monitoring & Logging

- **Application Logs**: Structured JSON logging
- **Error Tracking**: Centralized error collection
- **Performance Monitoring**: Response time tracking
- **Security Logging**: Authentication and authorization events

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

---

**Note**: This is a tracking application. Ensure compliance with local laws and regulations regarding privacy and surveillance.
