import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../interfaces/user.interface';
import { TenantRepository } from '../interfaces/tenant.interface';
import { redis } from '../config/redis';
import { logger } from '../config/logger';
import { createError } from '../middleware/errorHandler';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantName?: string;
  tenantDomain?: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  register(data: RegisterData): Promise<AuthResult>;
  refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
  logout(accessToken: string, refreshToken: string): Promise<void>;
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
  resetPassword(email: string): Promise<void>;
  verifyToken(token: string): Promise<any>;
}

export class AuthService implements IAuthService {
  constructor(
    private userRepository: UserRepository,
    private tenantRepository: TenantRepository
  ) {}

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { email, password } = credentials;

      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw createError('Invalid credentials', 401);
      }

      // Check if user is active
      if (!user.isActive) {
        throw createError('Account is deactivated', 401);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw createError('Invalid credentials', 401);
      }

      // Update last login
      await this.userRepository.updateLastLogin(user.id);

      // Generate tokens
      const tokens = await this.generateTokens(user);

      logger.info('User logged in successfully', { userId: user.id, email });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
        },
        tokens,
      };
    } catch (error) {
      logger.error('Login failed', { email, error });
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResult> {
    try {
      const { email, password, firstName, lastName, tenantName, tenantDomain } = data;

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw createError('User already exists', 409);
      }

      // Create or find tenant
      let tenantId: string;
      if (tenantName) {
        // Create new tenant
        const tenant = await this.tenantRepository.create({
          name: tenantName,
          domain: tenantDomain,
        });
        tenantId = tenant.id;
      } else {
        throw createError('Tenant information is required', 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await this.userRepository.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'TENANT_ADMIN', // First user in tenant becomes admin
        tenantId,
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      logger.info('User registered successfully', { userId: user.id, email, tenantId });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
        },
        tokens,
      };
    } catch (error) {
      logger.error('Registration failed', { email, error });
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
      
      // Check if refresh token is blacklisted
      const isBlacklisted = await redis.get(`blacklist:${refreshToken}`);
      if (isBlacklisted) {
        throw createError('Token has been revoked', 401);
      }

      // Get user
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw createError('User not found or inactive', 401);
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Blacklist old refresh token
      await redis.setEx(`blacklist:${refreshToken}`, 30 * 24 * 60 * 60, '1'); // 30 days

      return tokens;
    } catch (error) {
      logger.error('Token refresh failed', { error });
      throw error;
    }
  }

  async logout(accessToken: string, refreshToken: string): Promise<void> {
    try {
      // Decode tokens to get expiration times
      const accessDecoded = jwt.decode(accessToken) as any;
      const refreshDecoded = jwt.decode(refreshToken) as any;

      if (accessDecoded) {
        const accessExp = accessDecoded.exp - Math.floor(Date.now() / 1000);
        if (accessExp > 0) {
          await redis.setEx(`blacklist:${accessToken}`, accessExp, '1');
        }
      }

      if (refreshDecoded) {
        const refreshExp = refreshDecoded.exp - Math.floor(Date.now() / 1000);
        if (refreshExp > 0) {
          await redis.setEx(`blacklist:${refreshToken}`, refreshExp, '1');
        }
      }

      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout failed', { error });
      throw error;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Get user
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw createError('Current password is incorrect', 400);
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await this.userRepository.changePassword(userId, hashedNewPassword);

      logger.info('Password changed successfully', { userId });
    } catch (error) {
      logger.error('Password change failed', { userId, error });
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      // Check if user exists
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not
        logger.info('Password reset requested for non-existent user', { email });
        return;
      }

      // TODO: Implement email sending for password reset
      // For now, just log the request
      logger.info('Password reset requested', { userId: user.id, email });
    } catch (error) {
      logger.error('Password reset failed', { email, error });
      throw error;
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Check if token is blacklisted
      const isBlacklisted = await redis.get(`blacklist:${token}`);
      if (isBlacklisted) {
        throw createError('Token has been revoked', 401);
      }

      return decoded;
    } catch (error) {
      logger.error('Token verification failed', { error });
      throw error;
    }
  }

  private async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
  }
}
