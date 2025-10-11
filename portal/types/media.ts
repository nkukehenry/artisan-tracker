export interface CallLog {
  id: string;
  phoneNumber: string;
  contactName?: string;
  callType: 'INCOMING' | 'OUTGOING' | 'MISSED';
  duration: number;
  timestamp: string;
  location?: string;
  gpsCoordinates?: string;
}

export interface Media {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileType: 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  location?: string;
  gpsCoordinates?: string;
  callId?: string;
  call?: CallLog;
  metadata?: Record<string, unknown>;
  isEncrypted?: boolean;
  deviceId: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface MediaResponse {
  success: boolean;
  data: Media[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: {
    message: string;
    status: number;
    data: unknown;
  };
}

export interface MediaFilters {
  page?: number;
  limit?: number;
  fileType?: 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
}

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
}

export const parseGPSCoordinates = (gpsString?: string): GPSCoordinates | null => {
  if (!gpsString) return null;
  try {
    return JSON.parse(gpsString) as GPSCoordinates;
  } catch {
    return null;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

