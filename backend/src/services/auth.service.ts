import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../interfaces/user.interface';
import { TenantRepository } from '../interfaces/tenant.interface';
import { IAuthService, RegisterRequest, UserWithTokens } from '../interfaces/auth.interface';
import { redis } from '../config/redis';
import { logger } from '../config/logger';
import { createError } from '../middleware/errorHandler';


export class AuthService implements IAuthService {
  constructor(
    private userRepository: UserRepository,
    private tenantRepository: TenantRepository
  ) {}

  async login(email: string, password: string): Promise<UserWithTokens> {
    try {

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

      logger.info('User logged in successfully', { userId: user.id, email: user.email });

      return {
        user: user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      logger.error('Login failed', { email, error });
      throw error;
    }
  }

  async register(data: RegisterRequest): Promise<UserWithTokens> {
    try {
      const { email, password, firstName, lastName, tenantName, domain } = data;

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
          domain: domain || null,
          isActive: true,
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
        isActive: true,
        lastLoginAt: null,
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      logger.info('User registered successfully', { userId: user.id, email: user.email, tenantId });

      return {
        user: user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      logger.error('Registration failed', { email: data.email, error });
      throw error;
    }
  }

  async refreshToken(token: string): Promise<{ accessToken: string; newRefreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Check if refresh token is blacklisted
      const isBlacklisted = await redis.get(`blacklist:${token}`);
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
      await redis.set(`blacklist:${token}`, '1', 30 * 24 * 60 * 60); // 30 days

      return {
        accessToken: tokens.accessToken,
        newRefreshToken: tokens.refreshToken,
      };
    } catch (error) {
      logger.error('Token refresh failed', { error });
      throw error;
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      // Decode refresh token to get expiration time
      const refreshDecoded = jwt.decode(refreshToken) as any;


      if (refreshDecoded) {
        const refreshExp = refreshDecoded.exp - Math.floor(Date.now() / 1000);
        if (refreshExp > 0) {
          await redis.set(`blacklist:${refreshToken}`, '1', refreshExp);
        }
      }

      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout failed', { error });
      throw error;
    }
  }

  async getProfile(userId: string): Promise<any> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      logger.error('Get profile failed', { userId, error });
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

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    
    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, jwtSecret, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }
}
