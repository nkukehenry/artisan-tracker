import { BaseRepository, PaginatedResult, PaginationOptions, FilterOptions } from './repository.interface';
import { DeviceCommand } from './command.interface';

export interface Device {
  id: string;
  deviceId: string;
  name: string;
  model: string | null;
  osVersion: string | null;
  appVersion: string | null;
  isOnline: boolean;
  lastSeenAt: Date | null;
  batteryLevel: number | null;
  location: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  userId: string;
  latestTelemetryId: string | null;

  // Device Hardware Information
  brand: string | null;
  manufacturer: string | null;
  deviceName: string | null;
  product: string | null;
  board: string | null;
  hardware: string | null;

  // Android System Information
  sdkVersion: number | null;
  androidVersion: string | null;
  release: string | null;
  codename: string | null;
  incremental: string | null;
  securityPatch: string | null;

  // Memory and Storage
  totalMemoryGB: number | null;
  freeMemoryGB: number | null;
  totalStorageGB: number | null;
  freeStorageGB: number | null;
  usedMemoryPercentage: number | null;

  // Device State
  orientation: string | null;
  isRooted: boolean | null;
  isEmulator: boolean | null;
  screenDensity: number | null;
  screenResolution: string | null;

  // Network Information
  networkOperator: string | null;
  simOperator: string | null;
  simCountryISO: string | null;

  // App Information
  appVersionCode: number | null;
  appInstallTime: bigint | null;

  // Data Collection
  collectedAt: bigint | null;
}

export interface CreateDeviceData {
  deviceId: string;
  name: string;
  model?: string | null;
  osVersion?: string | null;
  appVersion?: string | null;
  isOnline?: boolean;
  batteryLevel?: number | null;
  location?: any;
  isActive?: boolean;
  tenantId: string;
  userId: string;

  // Device Hardware Information
  brand?: string | null;
  manufacturer?: string | null;
  deviceName?: string | null;
  product?: string | null;
  board?: string | null;
  hardware?: string | null;

  // Android System Information
  sdkVersion?: number | null;
  androidVersion?: string | null;
  release?: string | null;
  codename?: string | null;
  incremental?: string | null;
  securityPatch?: string | null;

  // Memory and Storage
  totalMemoryGB?: number | null;
  freeMemoryGB?: number | null;
  totalStorageGB?: number | null;
  freeStorageGB?: number | null;
  usedMemoryPercentage?: number | null;

  // Device State
  orientation?: string | null;
  isRooted?: boolean | null;
  isEmulator?: boolean | null;
  screenDensity?: number | null;
  screenResolution?: string | null;

  // Network Information
  networkOperator?: string | null;
  simOperator?: string | null;
  simCountryISO?: string | null;

  // App Information
  appVersionCode?: number | null;
  appInstallTime?: bigint | null;

  // Data Collection
  collectedAt?: bigint | null;

  // Latest telemetry reference
  latestTelemetryId?: string | null;
}

export interface UpdateDeviceData {
  name?: string;
  model?: string | null;
  osVersion?: string | null;
  appVersion?: string | null;
  isOnline?: boolean;
  lastSeenAt?: Date | null;
  location?: any | null;
  gpsCoordinates?: any | null;
  isActive?: boolean;

  // Device Hardware Information
  brand?: string | null;
  manufacturer?: string | null;
  deviceName?: string | null;
  product?: string | null;
  board?: string | null;
  hardware?: string | null;

  // Android System Information
  sdkVersion?: number | null;
  androidVersion?: string | null;
  release?: string | null;
  codename?: string | null;
  incremental?: string | null;
  securityPatch?: string | null;

  // Memory and Storage
  totalMemoryGB?: number | null;
  freeMemoryGB?: number | null;
  totalStorageGB?: number | null;
  freeStorageGB?: number | null;
  usedMemoryPercentage?: number | null;

  // Device State
  orientation?: string | null;
  isRooted?: boolean | null;
  isEmulator?: boolean | null;
  screenDensity?: number | null;
  screenResolution?: string | null;

  // Network Information
  networkOperator?: string | null;
  simOperator?: string | null;
  simCountryISO?: string | null;

  // Battery Information
  percentage?: string | null;
  temperature?: string | null;
  voltage?: string | null;
  current?: string | null;
  capacity?: string | null;
  batteryStatus?: string | null;
  chargeCounter?: string | null;
  energyCounter?: string | null;

  // App Information
  appVersionCode?: number | null;
  appInstallTime?: bigint | null;

  // Data Collection
  collectedAt?: bigint | null;

  // Latest telemetry reference
  latestTelemetryId?: string | null;
}

export interface DeviceRepository extends BaseRepository<Device> {
  findByDeviceId(deviceId: string): Promise<Device | null>;
  findByUser(userId: string, options?: PaginationOptions & FilterOptions): Promise<PaginatedResult<Device>>;
  findByTenant(tenantId: string, options?: PaginationOptions & FilterOptions): Promise<PaginatedResult<Device>>;
  updateStatus(id: string, isOnline: boolean, lastSeenAt?: Date, batteryLevel?: number, latestTelemetryId?: string): Promise<Device>;
  getDeviceStats(tenantId: string): Promise<{ total: number; online: number; offline: number }>;
}

// Service interfaces
export interface RegisterDeviceData {
  deviceId: string;
  name: string;
  model?: string | null;
  osVersion?: string | null;
  appVersion?: string | null;
  tenantId: string;
  userId: string;

  // Device Hardware Information
  brand?: string | null;
  manufacturer?: string | null;
  deviceName?: string | null;
  product?: string | null;
  board?: string | null;
  hardware?: string | null;

  // Android System Information
  sdkVersion?: number | null;
  androidVersion?: string | null;
  release?: string | null;
  codename?: string | null;
  incremental?: string | null;
  securityPatch?: string | null;

  // Memory and Storage
  totalMemoryGB?: number | null;
  freeMemoryGB?: number | null;
  totalStorageGB?: number | null;
  freeStorageGB?: number | null;
  usedMemoryPercentage?: number | null;

  // Device State
  orientation?: string | null;
  isRooted?: boolean | null;
  isEmulator?: boolean | null;
  screenDensity?: number | null;
  screenResolution?: string | null;

  // Network Information
  networkOperator?: string | null;
  simOperator?: string | null;
  simCountryISO?: string | null;

  // App Information
  appVersionCode?: number | null;
  appInstallTime?: bigint | null;

  // Data Collection
  collectedAt?: bigint | null;
}

export interface SendDeviceCommandData {
  deviceId: string;
  command: string;
  payload?: any;
}

export interface DeviceStatusUpdateData {
  isOnline: boolean;
  batteryLevel?: number | null;
  location?: any;
  latestTelemetryId?: string | null;
}

export interface IDeviceService {
  registerDevice(data: RegisterDeviceData): Promise<Device>;
  getDeviceById(id: string): Promise<Device | null>;
  getDeviceByDeviceId(deviceId: string): Promise<Device | null>;
  getDevicesByUser(userId: string, options?: PaginationOptions & FilterOptions): Promise<PaginatedResult<Device>>;
  getDevicesByTenant(tenantId: string, options?: PaginationOptions & FilterOptions): Promise<PaginatedResult<Device>>;
  updateDevice(id: string, data: UpdateDeviceData): Promise<Device>;
  deleteDevice(id: string): Promise<void>;
  sendCommand(data: SendDeviceCommandData): Promise<DeviceCommand>;
  getDeviceCommands(deviceId: string, options?: PaginationOptions & FilterOptions): Promise<PaginatedResult<DeviceCommand>>;
  updateDeviceStatus(deviceId: string, data: DeviceStatusUpdateData): Promise<Device>;
  getDeviceStatus(deviceId: string): Promise<any>;
  getDeviceStats(tenantId: string): Promise<{ total: number; online: number; offline: number }>;
}
