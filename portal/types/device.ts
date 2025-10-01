export interface Device {
  id: string;
  deviceId: string;
  name: string;
  model: string;
  osVersion: string;
  appVersion: string;
  type?: DeviceType;
  status?: DeviceStatus;
  owner?: string;
  location?: string;
  description?: string;
  lastSeenAt?: string;
  batteryLevel?: number;
  isOnline?: boolean;
  isActive?: boolean;
  tenantId?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export type DeviceType = 'smartphone' | 'tablet' | 'laptop' | 'watch' | 'other';
export type DeviceStatus = 'online' | 'offline' | 'in transit' | 'maintenance';

export interface DeviceFormData {
  deviceId: string;
  name: string;
  model: string;
  osVersion: string;
  appVersion: string;
}

export interface DeviceFilters {
  search: string;
  status: string;
  type: string;
}

export interface DeviceStats {
  total: number;
  online: number;
  offline: number;
  inTransit: number;
}

export interface DeviceLocation {
  id: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface DeviceCallLog {
  id: string;
  deviceId: string;
  phoneNumber: string;
  contactName?: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration?: number;
  timestamp: string;
  isDeleted: boolean;
}

export interface DeviceMessage {
  id: string;
  deviceId: string;
  phoneNumber: string;
  contactName?: string;
  content: string;
  type: 'sms' | 'mms';
  direction: 'incoming' | 'outgoing';
  timestamp: string;
  isDeleted: boolean;
  mediaUrls?: string[];
}

export interface DeviceMedia {
  id: string;
  deviceId: string;
  type: 'image' | 'video' | 'audio' | 'document';
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    camera?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
  timestamp: string;
  isDeleted: boolean;
}

export interface DeviceAppActivity {
  id: string;
  deviceId: string;
  appName: string;
  packageName: string;
  activity: string;
  timestamp: string;
  duration?: number;
  metadata?: {
    url?: string;
    title?: string;
    category?: string;
  };
}

export interface DeviceCommand {
  id: string;
  deviceId: string;
  type: string;
  payload?: any;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  createdAt: string;
  updatedAt: string;
  executedAt?: string;
  response?: any;
}

export interface CreateDeviceData {
  deviceId: string;
  name: string;
  model: string;
  osVersion: string;
  appVersion: string;
}

export interface UpdateDeviceData {
  name?: string;
  type?: DeviceType;
  owner?: string;
  location?: string;
  description?: string;
}
