import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import configurations
import { database } from './config/database';
import { redis } from './config/redis';
import { firebase } from './config/firebase';
import { logger, morganStream } from './config/logger';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Import routes
import authRoutes from './routes/auth';
import deviceRoutes from './routes/devices';
import mediaRoutes from './routes/media';
import portalRoutes from './routes/portal';

// Load environment variables
dotenv.config();

class Application {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001', 10);
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // HTTP request logging
    this.app.use(morgan('combined', { stream: morganStream }));

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
    this.app.use('/api/', limiter);

    // Custom request logging
    this.app.use(requestLogger);

    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const dbHealth = await database.healthCheck();
        const redisHealth = await redis.healthCheck();
        const firebaseHealth = await firebase.healthCheck();

        const health = {
          status: 'ok',
          timestamp: new Date().toISOString(),
          services: {
            database: dbHealth ? 'healthy' : 'unhealthy',
            redis: redisHealth ? 'healthy' : 'unhealthy',
            firebase: firebaseHealth ? 'healthy' : 'unhealthy',
          },
        };

        const isHealthy = dbHealth && redisHealth && firebaseHealth;
        res.status(isHealthy ? 200 : 503).json(health);
      } catch (error) {
        logger.error('Health check failed', error);
        res.status(503).json({
          status: 'error',
          message: 'Health check failed',
        });
      }
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/devices', deviceRoutes);
    this.app.use('/api/media', mediaRoutes);
    this.app.use('/api/portal', portalRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Mobile Tracker API',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method,
      });
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use(errorHandler);

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

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      this.shutdown();
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      this.shutdown();
    });
  }

  private async shutdown(): Promise<void> {
    try {
      logger.info('Starting graceful shutdown...');
      
      // Close database connection
      await database.disconnect();
      
      // Close Redis connection
      await redis.disconnect();
      
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  }

  public async start(): Promise<void> {
    try {
      // Initialize services
      await database.connect();
      await redis.connect();
      
      // Start server
      this.app.listen(this.port, () => {
        logger.info(`Server running on port ${this.port}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`Health check: http://localhost:${this.port}/health`);
      });
    } catch (error) {
      logger.error('Failed to start server', error);
      process.exit(1);
    }
  }
}

// Start the application
const app = new Application();
app.start().catch((error) => {
  logger.error('Application startup failed', error);
  process.exit(1);
});

export default app;
