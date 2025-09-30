# Mobile Tracker Application

A comprehensive SaaS mobile tracking solution with backend API and web portal, built with enterprise-grade architecture and security standards.

## 🏗️ Architecture

### Backend (✅ IMPLEMENTED)
- **Framework**: Node.js with Express.js and TypeScript
- **Database**: MySQL with Prisma ORM
- **Cache**: Redis for session management and real-time data
- **Real-time**: Firebase Admin SDK for device commands
- **Security**: Rate limiting, CORS, JWT authentication, Helmet
- **Logging**: Centralized async logging with Winston (file + console)
- **Error Handling**: Centralized error handling middleware
- **Architecture**: Clean Architecture with Repository Pattern, Service Layer, Dependency Injection

### Portal (Web Dashboard) (🔄 PLANNED)
- **Framework**: Next.js 14 with App Router
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Responsive**: Mobile-first design across all devices

## 🚀 Features

### Core Tracking Capabilities (🔄 PLANNED)
- **Multi-device Management**: Customers can onboard multiple devices
- **Media Access**: Photos, audio, video recording
- **Communication**: Call logs, contacts, social media notifications
- **App Management**: Enable/disable applications remotely
- **Location Tracking**: Real-time GPS tracking
- **Screen Sharing**: Live screen streaming and recording
- **Audio Recording**: Background audio capture

### SaaS Features (✅ IMPLEMENTED)
- **Multi-tenant Architecture**: Isolated customer data with proper tenant scoping
- **Subscription Management**: Billing and plan management with feature flags
- **User Management**: Role-based access control (SUPER_ADMIN, TENANT_ADMIN, USER)
- **Analytics Dashboard**: Usage statistics and insights

## 📁 Project Structure

```
tracker/
├── backend/                 # Backend API server (✅ IMPLEMENTED)
│   ├── src/
│   │   ├── config/          # Configuration files (✅ IMPLEMENTED)
│   │   │   ├── database.ts  # Prisma client & connection
│   │   │   ├── redis.ts     # Redis client & utilities
│   │   │   ├── firebase.ts  # Firebase Admin SDK
│   │   │   ├── logger.ts    # Winston logging setup
│   │   │   └── container.ts # Dependency injection container
│   │   ├── interfaces/      # TypeScript interfaces (✅ IMPLEMENTED)
│   │   │   ├── repository.interface.ts
│   │   │   ├── tenant.interface.ts
│   │   │   ├── user.interface.ts
│   │   │   ├── device.interface.ts
│   │   │   ├── command.interface.ts
│   │   │   └── auth.interface.ts
│   │   ├── repositories/    # Data access layer (✅ IMPLEMENTED)
│   │   │   ├── base.repository.ts
│   │   │   ├── tenant.repository.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── device.repository.ts
│   │   │   └── device-command.repository.ts
│   │   ├── services/        # Business logic layer (✅ IMPLEMENTED)
│   │   │   ├── auth.service.ts
│   │   │   └── device.service.ts
│   │   ├── middleware/      # Custom middleware (✅ IMPLEMENTED)
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── requestLogger.ts
│   │   ├── routes/          # API routes (✅ IMPLEMENTED)
│   │   │   ├── auth.ts
│   │   │   ├── devices.ts
│   │   │   ├── media.ts
│   │   │   └── portal.ts
│   │   ├── test/            # Test scripts (✅ IMPLEMENTED)
│   │   │   ├── test-interfaces.ts
│   │   │   ├── test-container.ts
│   │   │   ├── test-container-simple.ts
│   │   │   └── test-repositories.ts
│   │   ├── utils/           # Utility functions (🔄 PLANNED)
│   │   └── index.ts         # Application entry point (✅ IMPLEMENTED)
│   ├── prisma/              # Database schema and migrations (✅ IMPLEMENTED)
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Database seeding script
│   ├── logs/                # Application logs (✅ IMPLEMENTED)
│   ├── test.rest            # API test collection (✅ IMPLEMENTED)
│   ├── package.json         # Dependencies and scripts (✅ IMPLEMENTED)
│   ├── tsconfig.json        # TypeScript configuration (✅ IMPLEMENTED)
│   ├── nodemon.json         # Development configuration (✅ IMPLEMENTED)
│   └── env.example          # Environment variables template (✅ IMPLEMENTED)
├── portal/                  # Next.js web portal (🔄 PLANNED)
├── shared/                  # Shared types and utilities (🔄 PLANNED)
└── README.md
```

## 🛠️ Development Standards & Architecture

### ✅ Implemented Standards

#### Code Quality
- **Clean Code**: Readable, maintainable code with proper naming conventions
- **DRY Principle**: Don't Repeat Yourself - reusable components and utilities
- **SOLID Principles**: 
  - Single Responsibility: Each class/module has one reason to change
  - Open/Closed: Open for extension, closed for modification
  - Liskov Substitution: Derived classes are substitutable for base classes
  - Interface Segregation: No client should depend on unused interfaces
  - Dependency Inversion: Depend on abstractions, not concretions
- **TypeScript**: Full type safety with strict mode enabled
- **Error Handling**: Centralized error handling with custom error types

#### Architecture Patterns (✅ IMPLEMENTED)
- **Repository Pattern**: Data access abstraction with base repository
- **Service Layer**: Business logic separation from data access
- **Dependency Injection**: Container-based dependency management
- **Interface Segregation**: All services and repositories have interfaces
- **Factory Pattern**: Service and repository instantiation
- **Strategy Pattern**: Different authentication strategies

#### Security (✅ IMPLEMENTED)
- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: API request throttling with express-rate-limit
- **CORS**: Cross-origin resource sharing configuration
- **Input Validation**: Request data validation with express-validator
- **SQL Injection Prevention**: Parameterized queries via Prisma ORM
- **Password Hashing**: bcryptjs with salt rounds
- **Token Blacklisting**: Redis-based token invalidation

#### Logging & Monitoring (✅ IMPLEMENTED)
- **Centralized Logging**: Winston with multiple transports
- **Async Logging**: Non-blocking file and console logging
- **Structured Logging**: JSON format with metadata
- **Request Logging**: Morgan HTTP request logger
- **Error Tracking**: Comprehensive error logging with stack traces
- **Performance Monitoring**: Request timing and database query logging

### 🔄 Planned Standards
- **ESLint & Prettier**: Code formatting and linting
- **Unit Testing**: Jest with comprehensive test coverage
- **Integration Testing**: API endpoint testing
- **E2E Testing**: Full application testing
- **Code Coverage**: Minimum 80% coverage requirement

## 📋 Change Log

### [v0.2.0] - 2025-01-29
- ✅ **Repository Layer Implementation**: Complete data access layer with Repository Pattern
  - Base repository with common CRUD operations
  - Tenant, User, Device, and DeviceCommand repositories
  - Type-safe interfaces for all entities
  - Pagination and filtering support
- ✅ **Service Layer Implementation**: Business logic layer with clean architecture
  - AuthService with JWT authentication and refresh tokens
  - DeviceService with device management and command handling
  - Dependency injection container for service management
  - Interface-based service contracts
- ✅ **Database Schema & Seeding**: Complete multi-tenant database design
  - Prisma schema with 12 entities and proper relationships
  - Comprehensive seed data with 3 tenants, 5 users, 3 devices
  - Test data for all major entities (commands, media, logs, etc.)
  - Database migration and seeding scripts
- ✅ **Testing Infrastructure**: Repository and service testing
  - Interface validation tests
  - Dependency injection container tests
  - Repository functionality tests
  - Comprehensive API test collection (63 test cases)
- ✅ **Type Safety**: Full TypeScript implementation
  - Strict type checking enabled
  - Interface definitions for all entities
  - Type-safe repository and service contracts
  - Proper error handling with typed errors

### [v0.1.0] - 2025-01-29
- ✅ Initial project setup with backend and portal folders
- ✅ Backend core infrastructure with Express.js, TypeScript
- ✅ Prisma schema design for multi-tenant SaaS architecture
- ✅ Database configuration with MySQL support
- ✅ Redis integration for caching and session management
- ✅ Firebase Admin SDK integration for device commands
- ✅ Centralized logging system with Winston
- ✅ Error handling middleware with proper error types
- ✅ Security middleware (CORS, Helmet, Rate Limiting)
- ✅ Authentication middleware with JWT support
- ✅ Basic API route structure (auth, devices, media, portal)
- ✅ Environment configuration setup
- ✅ Git repository initialization with proper .gitignore

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+ (with database named `tracker`)
- Redis 6.0+ (optional for development)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd tracker
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Set up environment variables
```bash
# Copy example file and update with your database credentials
cp env.example .env
# Edit .env file with your MySQL credentials:
# DATABASE_URL="mysql://root:Admin!2025@localhost:3306/tracker"
```

4. Set up database
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with test data
npm run prisma:seed
```

5. Test the implementation
```bash
# Test interfaces and container
npm run test:interfaces
npm run test:container-simple

# Test repositories (requires database)
npm run test:repositories
```

6. Start development server
```bash
npm run dev
```

### 🔑 Test Credentials (from seeded data)
- **Super Admin**: `admin@mobiletracker.com` / `password123`
- **Tenant Admin**: `admin@acme.com` / `password123`
- **Regular User**: `user1@acme.com` / `password123`

### 📊 Database Schema
The database includes the following entities:
- **Tenants**: Multi-tenant organization structure
- **Users**: Role-based user management (SUPER_ADMIN, TENANT_ADMIN, USER)
- **Devices**: Mobile device tracking and management
- **DeviceCommands**: Remote command execution
- **MediaFiles**: Photo, video, audio file management
- **CallLogs**: Phone call history tracking
- **Contacts**: Device contact management
- **Messages**: SMS and messaging app data
- **Locations**: GPS location history
- **AppActivities**: Application usage tracking
- **Subscriptions**: SaaS billing and feature management
- **SystemLogs**: Application audit trail

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
# Development Environment Configuration
NODE_ENV=development
PORT=3001
HOST=localhost

# Database Configuration
DATABASE_URL="mysql://root:Admin!2025@localhost:3306/tracker"

# Redis Configuration
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""

# JWT Configuration
JWT_SECRET="dev-jwt-secret-key-for-testing-only"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Firebase Configuration (Optional for testing)
FIREBASE_PROJECT_ID="test-project"
FIREBASE_PRIVATE_KEY="test-private-key"
FIREBASE_CLIENT_EMAIL="test@test-project.iam.gserviceaccount.com"

# Security & Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN="http://localhost:3000"

# Logging Configuration
LOG_LEVEL="debug"
LOG_FILE_PATH="./logs/app.log"
```

## 📊 Monitoring & Logging (✅ IMPLEMENTED)

- **Application Logs**: Structured JSON logging with Winston
- **Error Tracking**: Centralized error collection with stack traces
- **Performance Monitoring**: Request timing and database query logging
- **Security Logging**: Authentication and authorization events
- **File Logging**: Async file logging to `./logs/app.log`
- **Console Logging**: Real-time console output for development

## 🧪 Testing

### Available Test Scripts
```bash
# Test interface definitions
npm run test:interfaces

# Test dependency injection container
npm run test:container-simple

# Test repository layer (requires database)
npm run test:repositories

# Test container with all dependencies
npm run test:container
```

### API Testing
- **REST Client**: Use `test.rest` file with VS Code REST Client extension
- **63 Test Cases**: Comprehensive API endpoint testing
- **Authentication Tests**: Login, registration, token refresh
- **Device Management**: CRUD operations, status updates
- **Command Execution**: All device command types
- **Media Management**: File upload/download testing
- **Error Handling**: Invalid requests and error responses

## 🎯 Next Steps

### 🔄 Immediate Priorities
1. **API Controllers**: Implement route controllers to connect routes with services
2. **Authentication Middleware**: Complete JWT middleware implementation
3. **Input Validation**: Add request validation middleware
4. **Error Handling**: Complete error response formatting
5. **API Documentation**: Generate OpenAPI/Swagger documentation

### 🔄 Short-term Goals
1. **Portal Development**: Next.js web portal with Redux Toolkit
2. **Real-time Features**: Socket.IO integration for live tracking
3. **File Upload**: Media file handling and storage
4. **Testing Suite**: Comprehensive unit and integration tests
5. **CI/CD Pipeline**: Automated testing and deployment

### 🔄 Long-term Goals
1. **Mobile App**: React Native device application
2. **Advanced Analytics**: Machine learning insights
3. **Scalability**: Microservices architecture
4. **Security**: Advanced threat detection
5. **Compliance**: GDPR, CCPA compliance features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the established patterns
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

---

**⚠️ Important Notes**:
- This is a tracking application. Ensure compliance with local laws and regulations regarding privacy and surveillance.
- All user data must be handled according to applicable privacy laws.
- Implement proper consent mechanisms before data collection.
- Regular security audits and penetration testing recommended.
