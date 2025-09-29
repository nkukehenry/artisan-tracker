import { PrismaClient } from '@prisma/client';
import { prisma } from './database';

// Repositories
import { TenantRepositoryImpl } from '../repositories/tenant.repository';
import { UserRepositoryImpl } from '../repositories/user.repository';
import { DeviceRepositoryImpl } from '../repositories/device.repository';
import { DeviceCommandRepositoryImpl } from '../repositories/device-command.repository';

// Services
import { AuthService } from '../services/auth.service';
import { DeviceService } from '../services/device.service';

// Interfaces
import { TenantRepository } from '../interfaces/tenant.interface';
import { UserRepository } from '../interfaces/user.interface';
import { DeviceRepository } from '../interfaces/device.interface';
import { DeviceCommandRepository } from '../interfaces/command.interface';
import { IAuthService } from '../services/auth.service';
import { IDeviceService } from '../services/device.service';

class Container {
  private static instance: Container;
  private repositories: Map<string, any> = new Map();
  private services: Map<string, any> = new Map();

  private constructor() {
    this.initializeRepositories();
    this.initializeServices();
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private initializeRepositories(): void {
    // Initialize repositories
    this.repositories.set('tenantRepository', new TenantRepositoryImpl(prisma));
    this.repositories.set('userRepository', new UserRepositoryImpl(prisma));
    this.repositories.set('deviceRepository', new DeviceRepositoryImpl(prisma));
    this.repositories.set('deviceCommandRepository', new DeviceCommandRepositoryImpl(prisma));
  }

  private initializeServices(): void {
    // Get repositories
    const tenantRepository = this.repositories.get('tenantRepository') as TenantRepository;
    const userRepository = this.repositories.get('userRepository') as UserRepository;
    const deviceRepository = this.repositories.get('deviceRepository') as DeviceRepository;
    const deviceCommandRepository = this.repositories.get('deviceCommandRepository') as DeviceCommandRepository;

    // Initialize services with dependencies
    this.services.set('authService', new AuthService(userRepository, tenantRepository));
    this.services.set('deviceService', new DeviceService(deviceRepository, deviceCommandRepository));
  }

  // Repository getters
  public getTenantRepository(): TenantRepository {
    return this.repositories.get('tenantRepository');
  }

  public getUserRepository(): UserRepository {
    return this.repositories.get('userRepository');
  }

  public getDeviceRepository(): DeviceRepository {
    return this.repositories.get('deviceRepository');
  }

  public getDeviceCommandRepository(): DeviceCommandRepository {
    return this.repositories.get('deviceCommandRepository');
  }

  // Service getters
  public getAuthService(): IAuthService {
    return this.services.get('authService');
  }

  public getDeviceService(): IDeviceService {
    return this.services.get('deviceService');
  }

  // Generic getter for testing
  public get<T>(key: string): T {
    return this.repositories.get(key) || this.services.get(key);
  }
}

export const container = Container.getInstance();
export default container;
