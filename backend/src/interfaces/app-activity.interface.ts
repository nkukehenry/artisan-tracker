import { BaseEntity, BaseRepository } from './repository.interface';

export interface AppActivity extends BaseEntity {
  id: string;
  deviceId: string;
  appName: string;
  packageName: string;
  activityType: 'OPENED' | 'CLOSED' | 'INSTALLED' | 'UNINSTALLED' | 'UPDATED' | 'PERMISSION_GRANTED' | 'PERMISSION_DENIED';
  duration?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
  isEncrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppActivityData {
  deviceId: string;
  appName: string;
  packageName: string;
  activityType: 'OPENED' | 'CLOSED' | 'INSTALLED' | 'UNINSTALLED' | 'UPDATED' | 'PERMISSION_GRANTED' | 'PERMISSION_DENIED';
  duration?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
  isEncrypted: boolean;
}

export interface AppUsageSummary {
  totalApps: number;
  totalUsageTime: number;
  mostUsedApps: Array<{
    appName: string;
    packageName: string;
    usageTime: number;
    openCount: number;
  }>;
}

export interface AppActivityRepository extends BaseRepository<AppActivity> {
  findByDevice(
    deviceId: string,
    paginationOptions: { page: number; limit: number },
    filterOptions?: {
      activityType?: string;
      appName?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{
    data: AppActivity[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>;

  getUsageSummary(
    deviceId: string,
    filterOptions?: {
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<AppUsageSummary>;
}


