import { PrismaClient } from '@prisma/client';
import { TelemetryRepository, Telemetry, CreateTelemetryData } from '../interfaces/telemetry.interface';
import { logger } from '../config/logger';

export class TelemetryRepositoryImpl implements TelemetryRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateTelemetryData): Promise<Telemetry> {
    try {
      const result = await this.prisma.telemetry.create({
        data: {
          deviceId: data.deviceId,
          
          // Device Info
          orientation: data.deviceInfo?.orientation,
          isRooted: data.deviceInfo?.isRooted,
          isEmulator: data.deviceInfo?.isEmulator,
          screenDensity: data.deviceInfo?.screenDensity,
          screenResolution: data.deviceInfo?.screenResolution,
          
          // Memory Info
          totalMemory: data.memoryInfo?.totalMemory,
          freeMemory: data.memoryInfo?.freeMemory,
          totalStorage: data.memoryInfo?.totalStorage,
          freeStorage: data.memoryInfo?.freeStorage,
          usedMemoryPercentage: data.memoryInfo?.usedMemoryPercentage,
          
          // System Info
          brand: data.systemInfo?.brand,
          manufacturer: data.systemInfo?.manufacturer,
          model: data.systemInfo?.model,
          deviceName: data.systemInfo?.device,
          product: data.systemInfo?.product,
          board: data.systemInfo?.board,
          hardware: data.systemInfo?.hardware,
          
          // OS Info
          sdkVersion: data.osInfo?.sdkVersion,
          androidVersion: data.osInfo?.androidVersion,
          osVersion: data.osInfo?.version,
          codename: data.osInfo?.codename,
          incremental: data.osInfo?.incremental,
          securityPatch: data.osInfo?.securityPatch,
          
          // Battery Info
          batteryPercentage: data.batteryInfo?.percentage,
          batteryTemperature: data.batteryInfo?.temperature,
          batteryVoltage: data.batteryInfo?.voltage,
          batteryCurrent: data.batteryInfo?.current,
          batteryCapacity: data.batteryInfo?.capacity,
          batteryStatus: data.batteryInfo?.batteryStatus,
          chargeCounter: data.batteryInfo?.chargeCounter,
          energyCounter: data.batteryInfo?.energyCounter,
          
          // App Version Info
          appVersion: data.appVersionInfo?.appVersion,
          appVersionCode: data.appVersionInfo?.appVersionCode,
          appInstallTime: data.appVersionInfo?.appInstallTime ? BigInt(data.appVersionInfo.appInstallTime) : null,
          
          // Network Info
          networkOperator: data.networkInfo?.networkOperator,
          simOperator: data.networkInfo?.simOperator,
          simCountryISO: data.networkInfo?.simCountryISO,
          
          // Location Info
          latitude: data.locationInfo?.latitude,
          longitude: data.locationInfo?.longitude,
          accuracy: data.locationInfo?.accuracy,
          altitude: data.locationInfo?.altitude,
          speed: data.locationInfo?.speed,
          heading: data.locationInfo?.heading,
          address: data.locationInfo?.address,
          
          // Timestamp
          collectedAt: new Date(data.collectedAt),
        },
      });

      const mappedResult: Telemetry = {
        id: result.id,
        deviceId: result.deviceId,
        orientation: result.orientation || undefined,
        isRooted: result.isRooted || undefined,
        isEmulator: result.isEmulator || undefined,
        screenDensity: result.screenDensity || undefined,
        screenResolution: result.screenResolution || undefined,
        totalMemory: result.totalMemory || undefined,
        freeMemory: result.freeMemory || undefined,
        totalStorage: result.totalStorage || undefined,
        freeStorage: result.freeStorage || undefined,
        usedMemoryPercentage: result.usedMemoryPercentage || undefined,
        brand: result.brand || undefined,
        manufacturer: result.manufacturer || undefined,
        model: result.model || undefined,
        deviceName: result.deviceName || undefined,
        product: result.product || undefined,
        board: result.board || undefined,
        hardware: result.hardware || undefined,
        sdkVersion: result.sdkVersion || undefined,
        androidVersion: result.androidVersion || undefined,
        osVersion: result.osVersion || undefined,
        codename: result.codename || undefined,
        incremental: result.incremental || undefined,
        securityPatch: result.securityPatch || undefined,
        batteryPercentage: result.batteryPercentage || undefined,
        batteryTemperature: result.batteryTemperature || undefined,
        batteryVoltage: result.batteryVoltage || undefined,
        batteryCurrent: result.batteryCurrent || undefined,
        batteryCapacity: result.batteryCapacity || undefined,
        batteryStatus: result.batteryStatus || undefined,
        chargeCounter: result.chargeCounter || undefined,
        energyCounter: result.energyCounter || undefined,
        appVersion: result.appVersion || undefined,
        appVersionCode: result.appVersionCode || undefined,
        appInstallTime: result.appInstallTime || undefined,
        networkOperator: result.networkOperator || undefined,
        simOperator: result.simOperator || undefined,
        simCountryISO: result.simCountryISO || undefined,
        latitude: result.latitude || undefined,
        longitude: result.longitude || undefined,
        accuracy: result.accuracy || undefined,
        altitude: result.altitude || undefined,
        speed: result.speed || undefined,
        heading: result.heading || undefined,
        address: result.address || undefined,
        collectedAt: result.collectedAt,
        createdAt: result.createdAt,
        updatedAt: result.createdAt, // Use createdAt as fallback
      };

      logger.info('Telemetry created successfully', { id: result.id, deviceId: data.deviceId });
      return mappedResult;
    } catch (error) {
      logger.error('Error creating Telemetry', { deviceId: data.deviceId, error });
      throw error;
    }
  }

  async findById(id: string): Promise<Telemetry | null> {
    try {
      const item = await this.prisma.telemetry.findUnique({
        where: { id },
      });

      if (!item) {
        return null;
      }

      return {
        id: item.id,
        deviceId: item.deviceId,
        orientation: item.orientation || undefined,
        isRooted: item.isRooted || undefined,
        isEmulator: item.isEmulator || undefined,
        screenDensity: item.screenDensity || undefined,
        screenResolution: item.screenResolution || undefined,
        totalMemory: item.totalMemory || undefined,
        freeMemory: item.freeMemory || undefined,
        totalStorage: item.totalStorage || undefined,
        freeStorage: item.freeStorage || undefined,
        usedMemoryPercentage: item.usedMemoryPercentage || undefined,
        brand: item.brand || undefined,
        manufacturer: item.manufacturer || undefined,
        model: item.model || undefined,
        deviceName: item.deviceName || undefined,
        product: item.product || undefined,
        board: item.board || undefined,
        hardware: item.hardware || undefined,
        sdkVersion: item.sdkVersion || undefined,
        androidVersion: item.androidVersion || undefined,
        osVersion: item.osVersion || undefined,
        codename: item.codename || undefined,
        incremental: item.incremental || undefined,
        securityPatch: item.securityPatch || undefined,
        batteryPercentage: item.batteryPercentage || undefined,
        batteryTemperature: item.batteryTemperature || undefined,
        batteryVoltage: item.batteryVoltage || undefined,
        batteryCurrent: item.batteryCurrent || undefined,
        batteryCapacity: item.batteryCapacity || undefined,
        batteryStatus: item.batteryStatus || undefined,
        chargeCounter: item.chargeCounter || undefined,
        energyCounter: item.energyCounter || undefined,
        appVersion: item.appVersion || undefined,
        appVersionCode: item.appVersionCode || undefined,
        appInstallTime: item.appInstallTime || undefined,
        networkOperator: item.networkOperator || undefined,
        simOperator: item.simOperator || undefined,
        simCountryISO: item.simCountryISO || undefined,
        latitude: item.latitude || undefined,
        longitude: item.longitude || undefined,
        accuracy: item.accuracy || undefined,
        altitude: item.altitude || undefined,
        speed: item.speed || undefined,
        heading: item.heading || undefined,
        address: item.address || undefined,
        collectedAt: item.collectedAt,
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
      };
    } catch (error) {
      logger.error('Error finding telemetry by ID', { id, error });
      throw error;
    }
  }

  async findByDevice(
    deviceId: string,
    paginationOptions: { page: number; limit: number }
  ): Promise<{
    data: Telemetry[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    try {
      const { page, limit } = paginationOptions;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.telemetry.findMany({
          where: { deviceId },
          skip,
          take: limit,
          orderBy: { collectedAt: 'desc' },
        }),
        this.prisma.telemetry.count({ where: { deviceId } }),
      ]);

      const mappedData: Telemetry[] = data.map(item => ({
        id: item.id,
        deviceId: item.deviceId,
        orientation: item.orientation || undefined,
        isRooted: item.isRooted || undefined,
        isEmulator: item.isEmulator || undefined,
        screenDensity: item.screenDensity || undefined,
        screenResolution: item.screenResolution || undefined,
        totalMemory: item.totalMemory || undefined,
        freeMemory: item.freeMemory || undefined,
        totalStorage: item.totalStorage || undefined,
        freeStorage: item.freeStorage || undefined,
        usedMemoryPercentage: item.usedMemoryPercentage || undefined,
        brand: item.brand || undefined,
        manufacturer: item.manufacturer || undefined,
        model: item.model || undefined,
        deviceName: item.deviceName || undefined,
        product: item.product || undefined,
        board: item.board || undefined,
        hardware: item.hardware || undefined,
        sdkVersion: item.sdkVersion || undefined,
        androidVersion: item.androidVersion || undefined,
        osVersion: item.osVersion || undefined,
        codename: item.codename || undefined,
        incremental: item.incremental || undefined,
        securityPatch: item.securityPatch || undefined,
        batteryPercentage: item.batteryPercentage || undefined,
        batteryTemperature: item.batteryTemperature || undefined,
        batteryVoltage: item.batteryVoltage || undefined,
        batteryCurrent: item.batteryCurrent || undefined,
        batteryCapacity: item.batteryCapacity || undefined,
        batteryStatus: item.batteryStatus || undefined,
        chargeCounter: item.chargeCounter || undefined,
        energyCounter: item.energyCounter || undefined,
        appVersion: item.appVersion || undefined,
        appVersionCode: item.appVersionCode || undefined,
        appInstallTime: item.appInstallTime || undefined,
        networkOperator: item.networkOperator || undefined,
        simOperator: item.simOperator || undefined,
        simCountryISO: item.simCountryISO || undefined,
        latitude: item.latitude || undefined,
        longitude: item.longitude || undefined,
        accuracy: item.accuracy || undefined,
        altitude: item.altitude || undefined,
        speed: item.speed || undefined,
        heading: item.heading || undefined,
        address: item.address || undefined,
        collectedAt: item.collectedAt,
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
      }));

      return {
        data: mappedData,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error finding telemetry by device', { deviceId, paginationOptions, error });
      throw error;
    }
  }

  async getLatestByDevice(deviceId: string): Promise<Telemetry | null> {
    try {
      const item = await this.prisma.telemetry.findFirst({
        where: { deviceId },
        orderBy: { collectedAt: 'desc' },
      });

      if (!item) {
        return null;
      }

      return {
        id: item.id,
        deviceId: item.deviceId,
        orientation: item.orientation || undefined,
        isRooted: item.isRooted || undefined,
        isEmulator: item.isEmulator || undefined,
        screenDensity: item.screenDensity || undefined,
        screenResolution: item.screenResolution || undefined,
        totalMemory: item.totalMemory || undefined,
        freeMemory: item.freeMemory || undefined,
        totalStorage: item.totalStorage || undefined,
        freeStorage: item.freeStorage || undefined,
        usedMemoryPercentage: item.usedMemoryPercentage || undefined,
        brand: item.brand || undefined,
        manufacturer: item.manufacturer || undefined,
        model: item.model || undefined,
        deviceName: item.deviceName || undefined,
        product: item.product || undefined,
        board: item.board || undefined,
        hardware: item.hardware || undefined,
        sdkVersion: item.sdkVersion || undefined,
        androidVersion: item.androidVersion || undefined,
        osVersion: item.osVersion || undefined,
        codename: item.codename || undefined,
        incremental: item.incremental || undefined,
        securityPatch: item.securityPatch || undefined,
        batteryPercentage: item.batteryPercentage || undefined,
        batteryTemperature: item.batteryTemperature || undefined,
        batteryVoltage: item.batteryVoltage || undefined,
        batteryCurrent: item.batteryCurrent || undefined,
        batteryCapacity: item.batteryCapacity || undefined,
        batteryStatus: item.batteryStatus || undefined,
        chargeCounter: item.chargeCounter || undefined,
        energyCounter: item.energyCounter || undefined,
        appVersion: item.appVersion || undefined,
        appVersionCode: item.appVersionCode || undefined,
        appInstallTime: item.appInstallTime || undefined,
        networkOperator: item.networkOperator || undefined,
        simOperator: item.simOperator || undefined,
        simCountryISO: item.simCountryISO || undefined,
        latitude: item.latitude || undefined,
        longitude: item.longitude || undefined,
        accuracy: item.accuracy || undefined,
        altitude: item.altitude || undefined,
        speed: item.speed || undefined,
        heading: item.heading || undefined,
        address: item.address || undefined,
        collectedAt: item.collectedAt,
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
      };
    } catch (error) {
      logger.error('Error getting latest telemetry', { deviceId, error });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.telemetry.delete({
        where: { id },
      });
      logger.info('Telemetry record deleted', { id });
    } catch (error) {
      logger.error('Error deleting telemetry record', { id, error });
      throw error;
    }
  }

  async deleteOldRecords(deviceId: string, keepLast: number = 100): Promise<number> {
    try {
      // Get the timestamp of the Nth most recent record
      const records = await this.prisma.telemetry.findMany({
        where: { deviceId },
        orderBy: { collectedAt: 'desc' },
        skip: keepLast,
        take: 1,
        select: { collectedAt: true },
      });

      if (records.length === 0) {
        return 0; // Not enough records to delete
      }

      const cutoffDate = records[0].collectedAt;

      const result = await this.prisma.telemetry.deleteMany({
        where: {
          deviceId,
          collectedAt: { lt: cutoffDate },
        },
      });

      logger.info('Old telemetry records deleted', { deviceId, count: result.count });
      return result.count;
    } catch (error) {
      logger.error('Error deleting old telemetry records', { deviceId, error });
      throw error;
    }
  }
}

