import { DeviceRepository } from '../interfaces/device.interface';
import { DeviceCommandRepository, CreateDeviceCommandData } from '../interfaces/command.interface';
import { firebase } from '../config/firebase';
import { redis } from '../config/redis';
import { logger } from '../config/logger';
import { createError } from '../middleware/errorHandler';

export interface DeviceStatus {
  isOnline: boolean;
  lastSeenAt?: Date;
  batteryLevel?: number;
  location?: any;
  appVersion?: string;
  osVersion?: string;
}

export interface IDeviceService {
  registerDevice(data: any): Promise<any>;
  updateDeviceStatus(deviceId: string, status: DeviceStatus): Promise<void>;
  getDeviceById(id: string): Promise<any>;
  getDevicesByTenant(tenantId: string, options?: any): Promise<any>;
  getDevicesByUser(userId: string, options?: any): Promise<any>;
  sendCommand(deviceId: string, command: string, payload?: any): Promise<any>;
  getDeviceCommands(deviceId: string, options?: any): Promise<any>;
  getDeviceStats(tenantId?: string): Promise<any>;
  deleteDevice(deviceId: string): Promise<void>;
}

export class DeviceService implements IDeviceService {
  constructor(
    private deviceRepository: DeviceRepository,
    private deviceCommandRepository: DeviceCommandRepository
  ) {}

  async registerDevice(data: any): Promise<any> {
    try {
      const { deviceId, name, model, osVersion, appVersion, tenantId, userId } = data;

      // Check if device already exists
      const existingDevice = await this.deviceRepository.findByDeviceId(deviceId);
      if (existingDevice) {
        throw createError('Device already registered', 409);
      }

      // Create device
      const device = await this.deviceRepository.create({
        deviceId,
        name,
        model,
        osVersion,
        appVersion,
        tenantId,
        userId,
        isOnline: true,
        lastSeenAt: new Date(),
      });

      // Cache device status
      await redis.setDeviceStatus(deviceId, {
        isOnline: true,
        lastSeenAt: new Date(),
      });

      logger.info('Device registered successfully', { deviceId, tenantId, userId });

      return device;
    } catch (error) {
      logger.error('Device registration failed', { data, error });
      throw error;
    }
  }

  async updateDeviceStatus(deviceId: string, status: DeviceStatus): Promise<void> {
    try {
      // Update in database
      await this.deviceRepository.updateDeviceStatus(deviceId, status);

      // Update cache
      await redis.setDeviceStatus(deviceId, status);

      logger.info('Device status updated successfully', { deviceId, status });
    } catch (error) {
      logger.error('Device status update failed', { deviceId, status, error });
      throw error;
    }
  }

  async getDeviceById(id: string): Promise<any> {
    try {
      const device = await this.deviceRepository.findById(id);
      if (!device) {
        throw createError('Device not found', 404);
      }

      // Get cached status
      const cachedStatus = await redis.getDeviceStatus(device.deviceId);
      if (cachedStatus) {
        device.isOnline = cachedStatus.isOnline;
        device.lastSeenAt = cachedStatus.lastSeenAt;
        device.batteryLevel = cachedStatus.batteryLevel;
        device.location = cachedStatus.location;
      }

      return device;
    } catch (error) {
      logger.error('Get device by ID failed', { id, error });
      throw error;
    }
  }

  async getDevicesByTenant(tenantId: string, options: any = {}): Promise<any> {
    try {
      const result = await this.deviceRepository.findByTenant(tenantId, options);
      
      // Update with cached status for each device
      for (const device of result.data) {
        const cachedStatus = await redis.getDeviceStatus(device.deviceId);
        if (cachedStatus) {
          device.isOnline = cachedStatus.isOnline;
          device.lastSeenAt = cachedStatus.lastSeenAt;
          device.batteryLevel = cachedStatus.batteryLevel;
          device.location = cachedStatus.location;
        }
      }

      return result;
    } catch (error) {
      logger.error('Get devices by tenant failed', { tenantId, options, error });
      throw error;
    }
  }

  async getDevicesByUser(userId: string, options: any = {}): Promise<any> {
    try {
      const result = await this.deviceRepository.findByUser(userId, options);
      
      // Update with cached status for each device
      for (const device of result.data) {
        const cachedStatus = await redis.getDeviceStatus(device.deviceId);
        if (cachedStatus) {
          device.isOnline = cachedStatus.isOnline;
          device.lastSeenAt = cachedStatus.lastSeenAt;
          device.batteryLevel = cachedStatus.batteryLevel;
          device.location = cachedStatus.location;
        }
      }

      return result;
    } catch (error) {
      logger.error('Get devices by user failed', { userId, options, error });
      throw error;
    }
  }

  async sendCommand(deviceId: string, command: string, payload?: any): Promise<any> {
    try {
      // Get device
      const device = await this.deviceRepository.findByDeviceId(deviceId);
      if (!device) {
        throw createError('Device not found', 404);
      }

      // Create command record
      const commandData: CreateDeviceCommandData = {
        deviceId: device.id,
        command: command as any,
        payload,
        status: 'PENDING',
      };

      const commandRecord = await this.deviceCommandRepository.create(commandData);

      // TODO: Send command via Firebase
      // For now, just mark as sent
      await this.deviceCommandRepository.updateCommandStatus(commandRecord.id, 'SENT');

      // Store in Firebase for device to pick up
      await firebase.storeDeviceCommand(deviceId, command, payload, 'pending');

      logger.info('Device command sent successfully', { deviceId, command, commandId: commandRecord.id });

      return commandRecord;
    } catch (error) {
      logger.error('Send device command failed', { deviceId, command, error });
      throw error;
    }
  }

  async getDeviceCommands(deviceId: string, options: any = {}): Promise<any> {
    try {
      // Get device
      const device = await this.deviceRepository.findByDeviceId(deviceId);
      if (!device) {
        throw createError('Device not found', 404);
      }

      const result = await this.deviceCommandRepository.findByDevice(device.id, options);
      return result;
    } catch (error) {
      logger.error('Get device commands failed', { deviceId, options, error });
      throw error;
    }
  }

  async getDeviceStats(tenantId?: string): Promise<any> {
    try {
      const stats = await this.deviceRepository.getDeviceStats(tenantId);
      return stats;
    } catch (error) {
      logger.error('Get device stats failed', { tenantId, error });
      throw error;
    }
  }

  async deleteDevice(deviceId: string): Promise<void> {
    try {
      // Get device
      const device = await this.deviceRepository.findByDeviceId(deviceId);
      if (!device) {
        throw createError('Device not found', 404);
      }

      // Cancel pending commands
      await this.deviceCommandRepository.cancelPendingCommands(device.id);

      // Delete device
      await this.deviceRepository.delete(device.id);

      // Remove from cache
      await redis.del(`device:${deviceId}:status`);

      logger.info('Device deleted successfully', { deviceId });
    } catch (error) {
      logger.error('Delete device failed', { deviceId, error });
      throw error;
    }
  }
}
