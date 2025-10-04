export interface Location {
  id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  address?: string;
  timestamp: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface LocationResponse {
  success: boolean;
  data: Location[];
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

export interface CurrentLocationResponse {
  success: boolean;
  data: Location;
  error?: {
    message: string;
    status: number;
    data: unknown;
  };
}

export interface LocationFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}
