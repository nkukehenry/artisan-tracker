import { BaseRepository } from './repository.interface';

export type MediaType = 'PHOTO' | 'VIDEO' | 'AUDIO' | 'SCREEN_RECORDING' | 'DOCUMENT' | 'OTHER';

export interface MediaFile {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: bigint;
  mimeType: string;
  fileType: MediaType;
  metadata?: any;
  isEncrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deviceId: string;
}

export interface CreateMediaFileData {
  fileName: string;
  filePath: string;
  fileSize: bigint;
  mimeType: string;
  fileType: 'PHOTO' | 'VIDEO' | 'AUDIO' | 'SCREEN_RECORDING';
  metadata?: any;
  isEncrypted?: boolean;
  deviceId: string;
}

export interface MediaFileRepository extends BaseRepository<MediaFile> {
  findByDevice(deviceId: string, options?: { page?: number; limit?: number; fileType?: string }): Promise<{ data: MediaFile[]; pagination: any }>;
  findByType(fileType: string, deviceId?: string, options?: { page?: number; limit?: number }): Promise<{ data: MediaFile[]; pagination: any }>;
  getTotalSize(deviceId?: string): Promise<bigint>;
  deleteByDevice(deviceId: string): Promise<void>;
}

export interface CallLog {
  id: string;
  phoneNumber: string;
  contactName?: string;
  callType: 'INCOMING' | 'OUTGOING' | 'MISSED' | 'REJECTED';
  duration?: number;
  timestamp: Date;
  isIncoming: boolean;
  createdAt: Date;
  updatedAt: Date;
  deviceId: string;
}

export interface CreateCallLogData {
  phoneNumber: string;
  contactName?: string;
  callType: 'INCOMING' | 'OUTGOING' | 'MISSED' | 'REJECTED';
  duration?: number;
  timestamp: Date;
  isIncoming: boolean;
  deviceId: string;
}

export interface CallLogRepository extends BaseRepository<CallLog> {
  findByDevice(deviceId: string, options?: { page?: number; limit?: number }): Promise<{ data: CallLog[]; pagination: any }>;
  findByPhoneNumber(phoneNumber: string, deviceId?: string): Promise<CallLog[]>;
  getCallStats(deviceId?: string): Promise<{
    total: number;
    incoming: number;
    outgoing: number;
    missed: number;
    rejected: number;
  }>;
}

export interface Contact {
  id: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  deviceId: string;
}

export interface CreateContactData {
  name: string;
  phoneNumber?: string;
  email?: string;
  avatar?: string;
  deviceId: string;
}

export interface UpdateContactData {
  name?: string;
  phoneNumber?: string;
  email?: string;
  avatar?: string;
}

export interface ContactRepository extends BaseRepository<Contact> {
  findByDevice(deviceId: string, options?: { page?: number; limit?: number }): Promise<{ data: Contact[]; pagination: any }>;
  findByPhoneNumber(phoneNumber: string, deviceId?: string): Promise<Contact[]>;
  searchContacts(query: string, deviceId?: string): Promise<Contact[]>;
}
