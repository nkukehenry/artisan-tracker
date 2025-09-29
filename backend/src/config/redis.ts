import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

class RedisService {
  private static instance: RedisService;
  private client: RedisClientType;
  private isConnected: boolean = false;

  private constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD || undefined,
    });

    this.client.on('error', (err) => {
      logger.error('Redis Client Error', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      logger.info('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      logger.warn('Redis client disconnected');
      this.isConnected = false;
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      logger.info('Redis connected successfully');
    } catch (error) {
      logger.error('Failed to connect to Redis', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      logger.info('Redis disconnected successfully');
    } catch (error) {
      logger.error('Failed to disconnect from Redis', error);
      throw error;
    }
  }

  public getClient(): RedisClientType {
    return this.client;
  }

  public isHealthy(): boolean {
    return this.isConnected;
  }

  // Session management
  public async setSession(sessionId: string, data: any, ttl: number = 3600): Promise<void> {
    try {
      await this.client.setEx(`session:${sessionId}`, ttl, JSON.stringify(data));
    } catch (error) {
      logger.error('Failed to set session', error);
      throw error;
    }
  }

  public async getSession(sessionId: string): Promise<any> {
    try {
      const data = await this.client.get(`session:${sessionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Failed to get session', error);
      throw error;
    }
  }

  public async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.client.del(`session:${sessionId}`);
    } catch (error) {
      logger.error('Failed to delete session', error);
      throw error;
    }
  }

  // Rate limiting
  public async incrementRateLimit(key: string, window: number = 900): Promise<number> {
    try {
      const current = await this.client.incr(`rate_limit:${key}`);
      if (current === 1) {
        await this.client.expire(`rate_limit:${key}`, window);
      }
      return current;
    } catch (error) {
      logger.error('Failed to increment rate limit', error);
      throw error;
    }
  }

  // Device status caching
  public async setDeviceStatus(deviceId: string, status: any, ttl: number = 300): Promise<void> {
    try {
      await this.client.setEx(`device:${deviceId}:status`, ttl, JSON.stringify(status));
    } catch (error) {
      logger.error('Failed to set device status', error);
      throw error;
    }
  }

  public async getDeviceStatus(deviceId: string): Promise<any> {
    try {
      const data = await this.client.get(`device:${deviceId}:status`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Failed to get device status', error);
      throw error;
    }
  }

  // Cache management
  public async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      logger.error('Failed to set cache', error);
      throw error;
    }
  }

  public async get(key: string): Promise<any> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Failed to get cache', error);
      throw error;
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Failed to delete cache', error);
      throw error;
    }
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed', error);
      return false;
    }
  }
}

export const redis = RedisService.getInstance();
export default redis;
