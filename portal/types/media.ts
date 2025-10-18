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
  fileSize: string; // Changed to string to match API response
  mimeType: string;
  fileType: 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  metadata?: {
    uploadedAt: string;
    uploadedBy: string;
    originalName: string;
    [key: string]: unknown;
  };
  isEncrypted: boolean;
  deviceId: string;
  createdAt: string;
  updatedAt: string;
  call?: {
    id: string;
    phoneNumber: string;
    contactName?: string;
    callType: 'INCOMING' | 'OUTGOING' | 'MISSED';
    duration: number;
    timestamp: string;
    location?: string;
    gpsCoordinates?: string;
  };
  location?: string;
  gpsCoordinates?: string;
  [key: string]: unknown;
}

export interface MediaResponse {
  success: boolean;
  message: string;
  data: {
    data: Media[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
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

export const formatFileSize = (bytes: string | number): string => {
  const numBytes = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (numBytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(numBytes) / Math.log(k));
  return Math.round(numBytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

