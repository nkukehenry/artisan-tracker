import { BaseEntity, BaseRepository } from './repository.interface';

export interface Telemetry extends BaseEntity {
  id: string;
  deviceId: string;
  
  // Device Info
  orientation?: string;
  isRooted?: boolean;
  isEmulator?: boolean;
  screenDensity?: number;
  screenResolution?: string;
  
  // Memory Info
  totalMemory?: number;
  freeMemory?: number;
  totalStorage?: number;
  freeStorage?: number;
  usedMemoryPercentage?: number;
  
  // System Info
  brand?: string;
  manufacturer?: string;
  model?: string;
  deviceName?: string;
  product?: string;
  board?: string;
  hardware?: string;
  
  // OS Info
  sdkVersion?: number;
  androidVersion?: string;
  osVersion?: string;
  codename?: string;
  incremental?: string;
  securityPatch?: string;
  
  // Battery Info
  batteryPercentage?: string;
  batteryTemperature?: string;
  batteryVoltage?: string;
  batteryCurrent?: string;
  batteryCapacity?: string;
  batteryStatus?: string;
  chargeCounter?: string;
  energyCounter?: string;
  
  // App Version Info
  appVersion?: string;
  appVersionCode?: number;
  appInstallTime?: bigint;
  
  // Network Info
  networkOperator?: string;
  simOperator?: string;
  simCountryISO?: string;
  
  // Location Info
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  address?: string;
  
  // Timestamps
  collectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTelemetryData {
  deviceId: string;
  
  // Device Info
  deviceInfo?: {
    orientation?: string;
    isRooted?: boolean;
    isEmulator?: boolean;
    screenDensity?: number;
    screenResolution?: string;
  };
  
  // Memory Info
  memoryInfo?: {
    totalMemory?: number;
    freeMemory?: number;
    totalStorage?: number;
    freeStorage?: number;
    usedMemoryPercentage?: number;
  };
  
  // System Info
  systemInfo?: {
    brand?: string;
    manufacturer?: string;
    model?: string;
    device?: string;
    product?: string;
    board?: string;
    hardware?: string;
  };
  
  // OS Info
  osInfo?: {
    sdkVersion?: number;
    androidVersion?: string;
    version?: string;
    codename?: string;
    incremental?: string;
    securityPatch?: string;
  };
  
  // Battery Info
  batteryInfo?: {
    percentage?: string;
    temperature?: string;
    voltage?: string;
    current?: string;
    capacity?: string;
    batteryStatus?: string;
    chargeCounter?: string;
    energyCounter?: string;
  };
  
  // App Version Info
  appVersionInfo?: {
    appVersion?: string;
    appVersionCode?: number;
    appInstallTime?: number;
  };
  
  // Network Info
  networkInfo?: {
    networkOperator?: string;
    simOperator?: string;
    simCountryISO?: string;
  };
  
  // Optional location data for device update
  locationInfo?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    speed?: number;
    heading?: number;
    address?: string;
  };
  
  collectedAt: number; // Timestamp in milliseconds
}

export interface TelemetryRepository {
  create(data: CreateTelemetryData): Promise<Telemetry>;
  
  findById(id: string): Promise<Telemetry | null>;
  
  findByDevice(
    deviceId: string,
    paginationOptions: { page: number; limit: number }
  ): Promise<{
    data: Telemetry[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>;
  
  getLatestByDevice(deviceId: string): Promise<Telemetry | null>;
  
  delete(id: string): Promise<void>;
  
  deleteOldRecords(deviceId: string, keepLast: number): Promise<number>;
}

