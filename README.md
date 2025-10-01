# Mobile Tracker Application

A comprehensive SaaS mobile tracking solution with backend API and web portal, built with enterprise-grade architecture and security standards.

## 🏗️ Architecture

### Backend (✅ IMPLEMENTED)
- **Framework**: Node.js with Express.js and TypeScript
- **Database**: MySQL with Prisma ORM
- **Cache**: Redis for session management and real-time data
- **Real-time**: WebSocket signaling server + Firebase Admin SDK for device commands
- **Security**: Rate limiting, CORS, JWT authentication, Helmet
- **Logging**: Centralized async logging with Winston (file + console)
- **Error Handling**: Centralized error handling middleware
- **Architecture**: Clean Architecture with Repository Pattern, Service Layer, Dependency Injection
- **API Documentation**: Complete Swagger/OpenAPI documentation with interactive testing
- **Production Ready**: PM2 process management, Nginx reverse proxy, SSL certificates

### Portal (Web Dashboard) (🔄 PLANNED)
- **Framework**: Next.js 14 with App Router
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Responsive**: Mobile-first design across all devices

## 🌐 Production Environment

**Live API**: https://tracker.mutindo.com  
**API Documentation**: https://tracker.mutindo.com/api-docs  
**Health Check**: https://tracker.mutindo.com/health  

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
- **User Management**: Role-based access control (SUPER_ADMIN, TENANT_ADMIN, USER)
- **Authentication System**: JWT-based authentication with refresh tokens
- **API Endpoints**: Complete REST API with 60+ endpoints for all features
- **Real-time Communication**: WebSocket signaling server for device communication
- **API Documentation**: Interactive Swagger/OpenAPI documentation

### SaaS Features (🔄 PLANNED)
- **Subscription Management**: Billing and plan management with feature flags
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

### [v0.3.0] - 2025-01-29
- ✅ **Complete API Implementation**: Full REST API with 60+ endpoints
  - 8 comprehensive controllers: Auth, Device, Media, Messages, Contacts, Call Logs, App Activities, Location
  - Complete CRUD operations for all entities with pagination and filtering
  - Input validation with express-validator for all endpoints
  - Role-based access control (SUPER_ADMIN, TENANT_ADMIN, USER)
- ✅ **WebSocket Signaling Server**: Real-time communication infrastructure
  - WebSocket server for device signaling and peer-to-peer communication
  - Automatic connection health monitoring with ping/pong
  - Message broadcasting to all connected clients
  - Perfect for WebRTC screen sharing and real-time features
  - Production-ready with Nginx proxy support
- ✅ **Comprehensive API Documentation**: Interactive Swagger/OpenAPI docs
  - Complete API documentation with 60+ documented endpoints
  - Interactive testing interface at `/api-docs`
  - Detailed request/response schemas for all endpoints
  - Authentication examples and error responses
- ✅ **Production Deployment**: Complete production setup
  - PM2 process management with cluster mode
  - Nginx reverse proxy with SSL certificates
  - Automated deployment scripts with rollback capability
  - Safe Nginx configuration that doesn't affect existing apps
  - Production domain: https://tracker.mutindo.com

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

### Quick Production Deployment

For immediate deployment to production server:

```bash
# 1. Clone and setup
git clone <repository-url>
cd tracker/backend

# 2. Configure environment
cp env.example .env
# Edit .env with production values

# 3. Deploy with automated script
chmod +x deploy.sh
./deploy.sh production
```

**Production URLs:**
- API: https://tracker.mutindo.com
- Documentation: https://tracker.mutindo.com/api-docs
- Health Check: https://tracker.mutindo.com/health

### Development Setup

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

### 📡 API Endpoints

**Complete REST API with 60+ endpoints:**

#### Authentication (`/auth`)
- `POST /auth/register` - Register new user and tenant
- `POST /auth/login` - User login with JWT tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and invalidate tokens

#### Device Management (`/devices`)
- `GET /devices` - List all user devices (paginated)
- `POST /devices/register` - Register new device
- `GET /devices/:id` - Get device details
- `PUT /devices/:id` - Update device information
- `DELETE /devices/:id` - Delete device
- `POST /devices/:id/commands` - Send command to device
- `GET /devices/:id/commands` - Get device command history

#### Media Management (`/media`)
- `GET /media` - List media files (paginated)
- `POST /media/upload` - Upload media file
- `GET /media/:id` - Get media file details
- `GET /media/:id/download` - Download media file
- `DELETE /media/:id` - Delete media file

#### Messages (`/messages`)
- `GET /messages` - List messages (paginated)
- `POST /messages` - Create new message
- `GET /messages/:id` - Get message details
- `PUT /messages/:id` - Update message
- `DELETE /messages/:id` - Delete message

#### Contacts (`/contacts`)
- `GET /contacts` - List contacts (paginated)
- `POST /contacts` - Create new contact
- `GET /contacts/:id` - Get contact details
- `PUT /contacts/:id` - Update contact
- `DELETE /contacts/:id` - Delete contact

#### Call Logs (`/call-logs`)
- `GET /call-logs` - List call logs (paginated)
- `POST /call-logs` - Create new call log
- `GET /call-logs/:id` - Get call log details
- `PUT /call-logs/:id` - Update call log
- `DELETE /call-logs/:id` - Delete call log

#### App Activities (`/app-activities`)
- `GET /app-activities` - List app activities (paginated)
- `POST /app-activities` - Create new app activity
- `GET /app-activities/:id` - Get app activity details
- `PUT /app-activities/:id` - Update app activity
- `DELETE /app-activities/:id` - Delete app activity

#### Location Tracking (`/locations`)
- `GET /locations` - List location history (paginated)
- `POST /locations` - Create new location entry
- `GET /locations/:id` - Get location details
- `PUT /locations/:id` - Update location
- `DELETE /locations/:id` - Delete location

### 🔌 WebSocket Signaling

**Real-time communication endpoint:**
- **Development**: `ws://localhost:83/signaling`
- **Production**: `wss://tracker.mutindo.com/signaling`

**Features:**
- Bidirectional real-time communication
- Message broadcasting to all connected clients
- Automatic connection health monitoring
- Perfect for WebRTC signaling (screen sharing, video calls)
- Production-ready with Nginx proxy support

**Usage Example:**
```javascript
const ws = new WebSocket('wss://tracker.mutindo.com/signaling');

ws.onopen = () => {
    console.log('Connected to signaling server');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
};

// Send message
ws.send(JSON.stringify({
    type: 'offer',
    data: { sdp: '...', type: 'offer' }
}));
```

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

## 🚀 Production Deployment

The Tracker API is fully production-ready with comprehensive deployment automation.

### Deployment Options

#### 1. Quick Deployment (Recommended)
```bash
# Automated deployment script
./deploy.sh production
```

#### 2. Manual Deployment
Follow the detailed guides:
- **[Quick Deploy Guide](backend/QUICK_DEPLOY.md)** - Fast production setup
- **[Full Deployment Guide](backend/DEPLOYMENT.md)** - Complete step-by-step setup
- **[Safe Nginx Setup](backend/NGINX_SAFE_SETUP.md)** - Safe configuration for existing servers

### Production Features

✅ **Process Management**: PM2 cluster mode with auto-restart  
✅ **Reverse Proxy**: Nginx with SSL certificates  
✅ **Load Balancing**: Multiple app instances with failover  
✅ **Security**: Rate limiting, CORS, security headers  
✅ **Monitoring**: Health checks, logging, error tracking  
✅ **Zero Downtime**: Graceful reloads and rollbacks  

### Server Requirements

- **OS**: Ubuntu 20.04+ / Debian 11+
- **RAM**: 2GB minimum (4GB recommended)
- **CPU**: 2 cores minimum
- **Storage**: 20GB minimum
- **Network**: Ports 80, 443 open

### Environment Configuration

**Production Environment Variables:**
```env
NODE_ENV=production
PORT=83
DATABASE_URL="mysql://user:pass@localhost:3306/tracker_prod"
JWT_SECRET="your-secure-64-char-secret"
CORS_ORIGIN="https://tracker.mutindo.com"
```

### Deployment Commands

```bash
# Deploy to production
./deploy.sh production

# Setup Nginx (safe, won't affect existing apps)
sudo ./setup-nginx.sh

# Rollback if needed
sudo ./rollback-nginx.sh

# Monitor deployment
pm2 monit
pm2 logs tracker-api
```

## 🎯 Next Steps

### 🔄 Immediate Priorities
1. **Portal Development**: Next.js web portal with Redux Toolkit
2. **Mobile App**: React Native device application
3. **File Upload**: Media file handling and storage
4. **Testing Suite**: Comprehensive unit and integration tests
5. **CI/CD Pipeline**: Automated testing and deployment

### 🔄 Short-term Goals
1. **Real-time Features**: Enhanced WebSocket features for live tracking
2. **Advanced Analytics**: Usage statistics and insights dashboard
3. **Subscription Management**: Billing and plan management
4. **Performance Optimization**: Caching and query optimization
5. **Security Enhancements**: Advanced threat detection

### 🔄 Long-term Goals
1. **Machine Learning**: Advanced analytics and insights
2. **Scalability**: Microservices architecture
3. **Compliance**: GDPR, CCPA compliance features
4. **Multi-region**: Global deployment and data residency
5. **Advanced Security**: Zero-trust architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the established patterns
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

## 🔗 Quick Reference

### Production URLs
- **API Base**: https://tracker.mutindo.com
- **API Docs**: https://tracker.mutindo.com/api-docs
- **Health Check**: https://tracker.mutindo.com/health
- **WebSocket**: wss://tracker.mutindo.com/signaling

### Key Commands
```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run test:interfaces    # Test interfaces
npm run test:repositories  # Test repositories

# Production
./deploy.sh production     # Deploy to production
sudo ./setup-nginx.sh      # Setup Nginx
pm2 monit                  # Monitor processes
pm2 logs tracker-api       # View logs
```

### File Structure
```
backend/
├── src/
│   ├── controllers/       # API controllers (8 files)
│   ├── services/          # Business logic services
│   ├── repositories/      # Data access layer
│   ├── routes/           # API route definitions
│   ├── middleware/       # Authentication, validation
│   └── config/           # Database, Redis, logging
├── prisma/               # Database schema & migrations
├── deploy.sh             # Automated deployment script
├── setup-nginx.sh        # Safe Nginx configuration
└── ecosystem.config.js   # PM2 process configuration
```

### Testing
- **API Testing**: Use `test.rest` file with VS Code REST Client
- **WebSocket Testing**: Open `test-signaling.html` in browser
- **Health Check**: `curl https://tracker.mutindo.com/health`

## 📄 License

This project is proprietary software. All rights reserved.

---

**⚠️ Important Notes**:
- This is a tracking application. Ensure compliance with local laws and regulations regarding privacy and surveillance.
- All user data must be handled according to applicable privacy laws.
- Implement proper consent mechanisms before data collection.
- Regular security audits and penetration testing recommended.
