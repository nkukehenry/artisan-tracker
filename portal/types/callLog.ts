export interface Media {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileType: 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  location?: string;
  gpsCoordinates?: string;
  metadata?: Record<string, unknown>;
  isEncrypted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CallLog {
  id: string;
  phoneNumber: string;
  contactName?: string;
  callType: 'INCOMING' | 'OUTGOING' | 'MISSED';
  duration: number;
  timestamp: string;
  isIncoming: boolean;
  location?: string;
  gpsCoordinates?: string;
  mediaId?: string;
  media?: Media;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface CallLogsResponse {
  success: boolean;
  data: CallLog[];
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

export interface CallLogFilters {
  page?: number;
  limit?: number;
  callType?: 'INCOMING' | 'OUTGOING' | 'MISSED';
}
