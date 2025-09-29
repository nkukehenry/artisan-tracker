import { PrismaClient } from '@prisma/client';
import { BaseRepository, BaseEntity, PaginationOptions, PaginatedResult, FilterOptions } from '../interfaces/repository.interface';
import { logger } from '../config/logger';

export abstract class BaseRepositoryImpl<T extends BaseEntity> implements BaseRepository<T> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  async findById(id: string): Promise<T | null> {
    try {
      const result = await (this.prisma as any)[this.modelName].findUnique({
        where: { id },
      });
      return result;
    } catch (error) {
      logger.error(`Error finding ${this.modelName} by ID`, { id, error });
      throw error;
    }
  }

  async findMany(options: PaginationOptions & { filters?: FilterOptions } = {}): Promise<PaginatedResult<T>> {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', filters = {} } = options;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        (this.prisma as any)[this.modelName].findMany({
          where: filters,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        (this.prisma as any)[this.modelName].count({ where: filters }),
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
      logger.error(`Error finding ${this.modelName} with pagination`, { options, error });
      throw error;
    }
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      const result = await (this.prisma as any)[this.modelName].create({
        data,
      });
      logger.info(`${this.modelName} created successfully`, { id: result.id });
      return result;
    } catch (error) {
      logger.error(`Error creating ${this.modelName}`, { data, error });
      throw error;
    }
  }

  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T> {
    try {
      const result = await (this.prisma as any)[this.modelName].update({
        where: { id },
        data,
      });
      logger.info(`${this.modelName} updated successfully`, { id });
      return result;
    } catch (error) {
      logger.error(`Error updating ${this.modelName}`, { id, data, error });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await (this.prisma as any)[this.modelName].delete({
        where: { id },
      });
      logger.info(`${this.modelName} deleted successfully`, { id });
    } catch (error) {
      logger.error(`Error deleting ${this.modelName}`, { id, error });
      throw error;
    }
  }

  async count(filters: FilterOptions = {}): Promise<number> {
    try {
      return await (this.prisma as any)[this.modelName].count({
        where: filters,
      });
    } catch (error) {
      logger.error(`Error counting ${this.modelName}`, { filters, error });
      throw error;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await (this.prisma as any)[this.modelName].count({
        where: { id },
      });
      return count > 0;
    } catch (error) {
      logger.error(`Error checking ${this.modelName} existence`, { id, error });
      throw error;
    }
  }
}
