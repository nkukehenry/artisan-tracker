export interface CallLog {
  id: string;
  phoneNumber: string;
  contactName?: string;
  callType: 'INCOMING' | 'OUTGOING' | 'MISSED';
  duration: number;
  timestamp: string;
  isIncoming: boolean;
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
