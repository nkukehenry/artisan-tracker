import { PrismaClient } from '@prisma/client';
import { BaseRepositoryImpl } from './base.repository';
import { TenantRepository, Tenant, CreateTenantData, UpdateTenantData } from '../interfaces/tenant.interface';
import { logger } from '../config/logger';

export class TenantRepositoryImpl extends BaseRepositoryImpl<Tenant> implements TenantRepository {
  constructor(prisma: PrismaClient) {
    super(prisma, 'tenant');
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    try {
      const result = await this.prisma.tenant.findUnique({
        where: { domain },
      });
      return result;
    } catch (error) {
      logger.error('Error finding tenant by domain', { domain, error });
      throw error;
    }
  }

  async findActiveTenants(): Promise<Tenant[]> {
    try {
      const result = await this.prisma.tenant.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      return result;
    } catch (error) {
      logger.error('Error finding active tenants', { error });
      throw error;
    }
  }

  async deactivateTenant(id: string): Promise<void> {
    try {
      await this.prisma.tenant.update({
        where: { id },
        data: { isActive: false },
      });
      logger.info('Tenant deactivated successfully', { id });
    } catch (error) {
      logger.error('Error deactivating tenant', { id, error });
      throw error;
    }
  }

  async activateTenant(id: string): Promise<void> {
    try {
      await this.prisma.tenant.update({
        where: { id },
        data: { isActive: true },
      });
      logger.info('Tenant activated successfully', { id });
    } catch (error) {
      logger.error('Error activating tenant', { id, error });
      throw error;
    }
  }

  async create(data: CreateTenantData): Promise<Tenant> {
    return super.create({
      ...data,
      domain: data.domain ?? null,
      isActive: data.isActive ?? true,
    });
  }

  async update(id: string, data: UpdateTenantData): Promise<Tenant> {
    return super.update(id, data);
  }
}
