import dotenv from "dotenv";
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

// Import configurations
import { prisma } from './config/database';
import { redis } from './config/redis';
import { logger, morganStream } from './config/logger';
import { swaggerSpec } from './config/swagger';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Import routes
import authRoutes from './routes/auth';
import deviceRoutes from './routes/devices';
import mediaRoutes from './routes/media';
import portalRoutes from './routes/portal';
import callLogsRoutes from './routes/call-logs';
import contactsRoutes from './routes/contacts';
import locationRoutes from './routes/location';
import appActivitiesRoutes from './routes/app-activities';
import messagesRoutes from './routes/messages';

// Import WebSocket signaling service
import { SignalingService } from './services/signaling.service';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = parseInt(process.env.PORT || '83', 10);

// Initialize WebSocket signaling server
let signalingService: SignalingService;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration - Allow all origins
app.use(cors({
  origin: '*', // Allow all origins
  credentials: false, // Must be false when origin is '*'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(morgan('combined', { stream: morganStream }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Custom request logging
app.use(requestLogger);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Artisan Tracker API Documentation',
}));

/**
 * @swagger
 * /signaling:
 *   get:
 *     summary: WebSocket signaling endpoint
 *     tags: [WebSocket]
 *     description: |
 *       **⚠️ This is a WebSocket endpoint, not a REST API endpoint**
 *       
 *       ### Connection URLs:
 *       - **Development:** `ws://localhost:83/signaling`
 *       - **Production:** `wss://tracker.mutindo.com/signaling`
 *       
 *       ### Features:
 *       - Real-time bidirectional communication
 *       - Message broadcasting to all connected clients (except sender)
 *       - Automatic health monitoring with ping/pong
 *       - Perfect for WebRTC signaling (screen sharing, video calls)
 *       
 *       ### Connection Example:
 *       ```javascript
 *       const ws = new WebSocket('ws://localhost:83/signaling');
 *       
 *       ws.onopen = () => {
 *         console.log('Connected to signaling server');
 *       };
 *       
 *       ws.onmessage = (event) => {
 *         const data = JSON.parse(event.data);
 *         console.log('Received:', data);
 *       };
 *       
 *       // Send message
 *       ws.send(JSON.stringify({
 *         type: 'offer',
 *         data: { sdp: '...', type: 'offer' }
 *       }));
 *       ```
 *       
 *       ### Message Broadcasting:
 *       Any message sent by a client is automatically broadcast to all other connected clients.
 *       This enables peer-to-peer signaling for WebRTC connections.
 *       
 *       ### Testing:
 *       - Open the test page: http://localhost:83/test-signaling.html
 *       - Or use wscat: `wscat -c ws://localhost:83/signaling`
 *       
 *       ### Documentation:
 *       See WEBSOCKET_SIGNALING.md for complete documentation including:
 *       - WebRTC screen sharing examples
 *       - Message format specifications
 *       - Connection health monitoring
 *       - Security considerations
 *     responses:
 *       101:
 *         description: Switching Protocols - WebSocket connection established
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebSocketConnectedMessage'
 *             example:
 *               type: 'connected'
 *               message: 'Connected to signaling server'
 *               clientsCount: 3
 *       400:
 *         description: Bad Request - Invalid WebSocket upgrade request
 *       426:
 *         description: Upgrade Required - Client must upgrade to WebSocket protocol
 *
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All services are healthy
 *       503:
 *         description: One or more services are unhealthy
 */
app.get('/health', async (req, res) => {
  try {
    // Check database
    let dbHealth = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbHealth = true;
    } catch (error) {
      logger.error('Database health check failed', error);
    }

    const redisHealth = await redis.healthCheck();

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth ? 'healthy' : 'unhealthy',
        redis: redisHealth ? 'healthy' : 'unhealthy',
      },
    };

    const isHealthy = dbHealth && redisHealth;
    res.status(isHealthy ? 200 : 503).json(health);
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Artisan Tracker API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    documentation: '/api-docs',
    health: '/health',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/call-logs', callLogsRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/app-activities', appActivitiesRoutes);
app.use('/api/messages', messagesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown handler
const shutdown = async () => {
  try {
    logger.info('Starting graceful shutdown...');
    
    server.close(() => {
      logger.info('HTTP server closed');
    });
    
    // Close WebSocket connections
    if (signalingService) {
      await signalingService.shutdown();
    }
    
    await prisma.$disconnect();
    logger.info('Database disconnected');
    
    await redis.disconnect();
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Graceful shutdown signals
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  shutdown();
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  shutdown();
});

// Start the application
const startServer = async () => {
  try {
    // Initialize services
    await redis.connect();
    logger.info('Services initialized');
    
    // Start server
    server.listen(PORT, () => {
      // Initialize WebSocket signaling server after HTTP server starts
      signalingService = new SignalingService(server);
      
      logger.info(`🚀 Artisan Tracker API running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`💚 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔗 API endpoints: http://localhost:${PORT}/api`);
      logger.info(`🔌 WebSocket signaling: ws://localhost:${PORT}/signaling`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();

export default app;
