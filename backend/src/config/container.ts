import { PrismaClient } from '@prisma/client';
import { prisma } from './database';

// Repositories
import { TenantRepositoryImpl } from '../repositories/tenant.repository';
import { UserRepositoryImpl } from '../repositories/user.repository';
import { DeviceRepositoryImpl } from '../repositories/device.repository';
import { DeviceCommandRepositoryImpl } from '../repositories/device-command.repository';
import { CallLogRepositoryImpl } from '../repositories/call-log.repository';
import { ContactRepositoryImpl } from '../repositories/contact.repository';
import { LocationRepositoryImpl } from '../repositories/location.repository';
import { AppActivityRepositoryImpl } from '../repositories/app-activity.repository';
import { MessageRepositoryImpl } from '../repositories/message.repository';
import { MediaFileRepositoryImpl } from '../repositories/media.repository';
import { TelemetryRepositoryImpl } from '../repositories/telemetry.repository';

// Services
import { AuthService } from '../services/auth.service';
import { DeviceService } from '../services/device.service';
import { MediaService } from '../services/media.service';

// Interfaces
import { TenantRepository } from '../interfaces/tenant.interface';
import { UserRepository } from '../interfaces/user.interface';
import { DeviceRepository } from '../interfaces/device.interface';
import { DeviceCommandRepository } from '../interfaces/command.interface';
import { IAuthService } from '../interfaces/auth.interface';
import { IDeviceService } from '../interfaces/device.interface';
import { IMediaService } from '../interfaces/media.interface';

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
    this.repositories.set('callLogRepository', new CallLogRepositoryImpl(prisma));
    this.repositories.set('contactRepository', new ContactRepositoryImpl(prisma));
    this.repositories.set('locationRepository', new LocationRepositoryImpl(prisma));
    this.repositories.set('appActivityRepository', new AppActivityRepositoryImpl(prisma));
    this.repositories.set('messageRepository', new MessageRepositoryImpl(prisma));
    this.repositories.set('mediaFileRepository', new MediaFileRepositoryImpl(prisma));
    this.repositories.set('telemetryRepository', new TelemetryRepositoryImpl(prisma));
  }

  private initializeServices(): void {
    // Get repositories
    const tenantRepository = this.repositories.get('tenantRepository') as TenantRepository;
    const userRepository = this.repositories.get('userRepository') as UserRepository;
    const deviceRepository = this.repositories.get('deviceRepository') as DeviceRepository;
    const deviceCommandRepository = this.repositories.get('deviceCommandRepository') as DeviceCommandRepository;
    const mediaFileRepository = this.repositories.get('mediaFileRepository');

    // Initialize services with dependencies
    this.services.set('authService', new AuthService(userRepository, tenantRepository));
    this.services.set('deviceService', new DeviceService(deviceRepository, deviceCommandRepository));
    this.services.set('mediaService', new MediaService(mediaFileRepository));
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

  public getMediaService(): IMediaService {
    return this.services.get('mediaService');
  }

  // Generic getter for testing
  public get<T>(key: string): T {
    return this.repositories.get(key) || this.services.get(key);
  }

  // Repository getter
  public getRepository<T>(name: string): T {
    if (!this.repositories.has(name)) {
      throw new Error(`Repository ${name} not found`);
    }
    return this.repositories.get(name) as T;
  }

  // Service getter
  public getService<T>(name: string): T {
    if (!this.services.has(name)) {
      throw new Error(`Service ${name} not found`);
    }
    return this.services.get(name) as T;
  }
}

export { Container };
export const container = Container.getInstance();
export default container;
