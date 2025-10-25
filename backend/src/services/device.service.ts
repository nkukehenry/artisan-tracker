import { DeviceRepository } from '../interfaces/device.interface';
import { DeviceCommandRepository, CreateDeviceCommandData } from '../interfaces/command.interface';
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

// Import the interface from the interfaces file instead of defining it here
import { IDeviceService } from '../interfaces/device.interface';

export class DeviceService implements IDeviceService {
  constructor(
    private deviceRepository: DeviceRepository,
    private deviceCommandRepository: DeviceCommandRepository
  ) { }

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
        model: model || null,
        osVersion: osVersion || null,
        appVersion: appVersion || null,
        tenantId,
        userId,
        isOnline: true,
        lastSeenAt: new Date(),
        batteryLevel: null,
        location: null,
        isActive: true,
        // Initialize all new fields as null
        brand: data.brand || null,
        manufacturer: data.manufacturer || null,
        deviceName: data.deviceName || null,
        product: data.product || null,
        board: data.board || null,
        hardware: data.hardware || null,
        sdkVersion: data.sdkVersion || null,
        androidVersion: data.androidVersion || null,
        release: data.release || null,
        codename: data.codename || null,
        incremental: data.incremental || null,
        securityPatch: data.securityPatch || null,
        totalMemoryGB: data.totalMemoryGB || null,
        freeMemoryGB: data.freeMemoryGB || null,
        totalStorageGB: data.totalStorageGB || null,
        freeStorageGB: data.freeStorageGB || null,
        usedMemoryPercentage: data.usedMemoryPercentage || null,
        orientation: data.orientation || null,
        isRooted: data.isRooted || null,
        isEmulator: data.isEmulator || null,
        screenDensity: data.screenDensity || null,
        screenResolution: data.screenResolution || null,
        networkOperator: data.networkOperator || null,
        simOperator: data.simOperator || null,
        simCountryISO: data.simCountryISO || null,
        appVersionCode: data.appVersionCode || null,
        appInstallTime: data.appInstallTime || null,
        collectedAt: data.collectedAt || null,
        latestTelemetryId: null,
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

  async updateDeviceStatus(deviceId: string, data: any): Promise<any> {
    try {
      // Update in database
      await this.deviceRepository.updateStatus(deviceId, data.isOnline, new Date(), data.batteryLevel, data.latestTelemetryId);

      // Update cache
      await redis.setDeviceStatus(deviceId, data);

      // Get updated device
      const device = await this.deviceRepository.findByDeviceId(deviceId);

      logger.info('Device status updated successfully', { deviceId, data });
      return device;
    } catch (error) {
      logger.error('Device status update failed', { deviceId, data, error });
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

  async getDeviceByDeviceId(deviceId: string): Promise<any> {
    try {
      const device = await this.deviceRepository.findByDeviceId(deviceId);
      if (!device) {
        return null;
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
      logger.error('Get device by device ID failed', { deviceId, error });
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


  async getDeviceStats(tenantId: string): Promise<any> {
    try {
      const stats = await this.deviceRepository.getDeviceStats(tenantId);
      return stats;
    } catch (error) {
      logger.error('Get device stats failed', { tenantId, error });
      throw error;
    }
  }

  async deleteDevice(id: string): Promise<void> {
    try {
      // Get device
      const device = await this.deviceRepository.findById(id);
      if (!device) {
        throw createError('Device not found', 404);
      }

      // Cancel pending commands
      await this.deviceCommandRepository.cancelPendingCommands(device.id);

      // Delete device
      await this.deviceRepository.delete(device.id);

      // Remove from cache
      await redis.del(`device:${device.deviceId}:status`);

      logger.info('Device deleted successfully', { deviceId: device.deviceId });
    } catch (error) {
      logger.error('Delete device failed', { id, error });
      throw error;
    }
  }

  async updateDevice(id: string, data: any): Promise<any> {
    try {
      const device = await this.deviceRepository.update(id, data);
      if (!device) {
        throw createError('Device not found', 404);
      }

      logger.info('Device updated successfully', { id, data });
      return device;
    } catch (error) {
      logger.error('Update device failed', { id, data, error });
      throw error;
    }
  }

  async sendCommand(data: any): Promise<any> {
    try {
      const { deviceId, command, payload } = data;

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
        sentAt: new Date(),
        executedAt: null,
        response: null,
      };

      const commandRecord = await this.deviceCommandRepository.create(commandData);

      // Mark as sent
      await this.deviceCommandRepository.updateCommandStatus(commandRecord.id, 'SENT');

      logger.info('Device command sent successfully', { deviceId, command, commandId: commandRecord.id });

      return commandRecord;
    } catch (error) {
      logger.error('Send device command failed', { data, error });
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

  async getDeviceStatus(deviceId: string): Promise<any> {
    try {
      const cachedStatus = await redis.getDeviceStatus(deviceId);
      return cachedStatus;
    } catch (error) {
      logger.error('Get device status failed', { deviceId, error });
      throw error;
    }
  }
}
