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
}

export interface UpdateDeviceData {
  name?: string;
  model?: string | null;
  osVersion?: string | null;
  appVersion?: string | null;
  isOnline?: boolean;
  lastSeenAt?: Date | null;
  batteryLevel?: number | null;
  location?: any;
  isActive?: boolean;
}

export interface DeviceRepository extends BaseRepository<Device> {
  findByDeviceId(deviceId: string): Promise<Device | null>;
  findByUser(userId: string, options?: PaginationOptions & FilterOptions): Promise<PaginatedResult<Device>>;
  findByTenant(tenantId: string, options?: PaginationOptions & FilterOptions): Promise<PaginatedResult<Device>>;
  updateStatus(id: string, isOnline: boolean, lastSeenAt?: Date, batteryLevel?: number): Promise<Device>;
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
