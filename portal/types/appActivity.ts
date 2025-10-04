export interface AppActivity {
  id: string;
  appName: string;
  packageName: string;
  usageTime: number;
  timestamp: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface AppUsageSummary {
  totalApps: number;
  totalUsageTime: number;
  mostUsedApps: string;
}

export interface AppActivitiesResponse {
  success: boolean;
  data: AppActivity[];
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

export interface AppUsageSummaryResponse {
  success: boolean;
  data: AppUsageSummary;
  error?: {
    message: string;
    status: number;
    data: unknown;
  };
}

export interface AppActivityFilters {
  page?: number;
  limit?: number;
  appName?: string;
  startDate?: string;
  endDate?: string;
}
