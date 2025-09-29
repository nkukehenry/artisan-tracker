import { PrismaClient } from '@prisma/client';
import { BaseRepositoryImpl } from './base.repository';
import { UserRepository, User, CreateUserData, UpdateUserData } from '../interfaces/user.interface';
import { logger } from '../config/logger';

export class UserRepositoryImpl extends BaseRepositoryImpl<User> implements UserRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'user');
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.prisma.user.findUnique({
        where: { email },
      });
      return result;
    } catch (error) {
      logger.error('Error finding user by email', { email, error });
      throw error;
    }
  }

  async findByTenant(tenantId: string, options: { page?: number; limit?: number } = {}): Promise<{ data: User[]; pagination: any }> {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.user.findMany({
          where: { tenantId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.user.count({ where: { tenantId } }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error('Error finding users by tenant', { tenantId, options, error });
      throw error;
    }
  }

  async findByRole(role: string, tenantId?: string): Promise<User[]> {
    try {
      const where: any = { role };
      if (tenantId) {
        where.tenantId = tenantId;
      }

      const result = await this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      return result;
    } catch (error) {
      logger.error('Error finding users by role', { role, tenantId, error });
      throw error;
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { lastLoginAt: new Date() },
      });
      logger.info('User last login updated successfully', { id });
    } catch (error) {
      logger.error('Error updating user last login', { id, error });
      throw error;
    }
  }

  async changePassword(id: string, hashedPassword: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });
      logger.info('User password changed successfully', { id });
    } catch (error) {
      logger.error('Error changing user password', { id, error });
      throw error;
    }
  }

  async deactivateUser(id: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
      logger.info('User deactivated successfully', { id });
    } catch (error) {
      logger.error('Error deactivating user', { id, error });
      throw error;
    }
  }

  async activateUser(id: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { isActive: true },
      });
      logger.info('User activated successfully', { id });
    } catch (error) {
      logger.error('Error activating user', { id, error });
      throw error;
    }
  }

  async create(data: CreateUserData): Promise<User> {
    return super.create({
      ...data,
      role: data.role ?? 'USER',
      isActive: data.isActive ?? true,
      lastLoginAt: null,
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return super.update(id, data);
  }
}
