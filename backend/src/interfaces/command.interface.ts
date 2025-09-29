import { BaseRepository } from './repository.interface';

export interface DeviceCommand {
  id: string;
  command: 'RECORD_AUDIO' | 'RECORD_VIDEO' | 'SCREEN_RECORDING' | 'TAKE_PHOTO' | 'GET_LOCATION' | 'GET_CONTACTS' | 'GET_CALL_LOGS' | 'GET_MESSAGES' | 'ENABLE_APP' | 'DISABLE_APP' | 'RESTART_DEVICE' | 'WIPE_DATA';
  payload?: any;
  status: 'PENDING' | 'SENT' | 'EXECUTED' | 'FAILED' | 'CANCELLED';
  sentAt: Date;
  executedAt: Date | null;
  response: any;
  createdAt: Date;
  updatedAt: Date;
  deviceId: string;
}

export interface CreateDeviceCommandData {
  command: 'RECORD_AUDIO' | 'RECORD_VIDEO' | 'SCREEN_RECORDING' | 'TAKE_PHOTO' | 'GET_LOCATION' | 'GET_CONTACTS' | 'GET_CALL_LOGS' | 'GET_MESSAGES' | 'ENABLE_APP' | 'DISABLE_APP' | 'RESTART_DEVICE' | 'WIPE_DATA';
  payload?: any;
  status: 'PENDING' | 'SENT' | 'EXECUTED' | 'FAILED' | 'CANCELLED';
  deviceId: string;
  sentAt: Date;
  executedAt: Date | null;
  response: any;
}

export interface UpdateDeviceCommandData {
  status?: 'PENDING' | 'SENT' | 'EXECUTED' | 'FAILED' | 'CANCELLED';
  sentAt?: Date;
  executedAt?: Date | null;
  response?: any;
}

export interface DeviceCommandRepository extends BaseRepository<DeviceCommand> {
  findByDevice(deviceId: string, options?: { page?: number; limit?: number; status?: string }): Promise<{ data: DeviceCommand[]; pagination: any }>;
  findByStatus(status: string, deviceId?: string): Promise<DeviceCommand[]>;
  findPendingCommands(deviceId?: string): Promise<DeviceCommand[]>;
  updateCommandStatus(id: string, status: string, response?: any): Promise<void>;
  cancelPendingCommands(deviceId: string): Promise<void>;
  getCommandStats(deviceId?: string): Promise<{
    total: number;
    pending: number;
    sent: number;
    executed: number;
    failed: number;
    cancelled: number;
  }>;
}
