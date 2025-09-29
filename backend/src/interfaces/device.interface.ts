import { BaseRepository } from './repository.interface';

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
  findByTenant(tenantId: string, options?: { page?: number; limit?: number }): Promise<{ data: Device[]; pagination: any }>;
  findByUser(userId: string, options?: { page?: number; limit?: number }): Promise<{ data: Device[]; pagination: any }>;
  findOnlineDevices(tenantId?: string): Promise<Device[]>;
  updateDeviceStatus(deviceId: string, status: Partial<UpdateDeviceData>): Promise<void>;
  updateLastSeen(deviceId: string): Promise<void>;
  getDeviceStats(tenantId?: string): Promise<{
    total: number;
    online: number;
    offline: number;
    active: number;
    inactive: number;
  }>;
}
