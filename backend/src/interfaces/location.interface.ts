import { BaseEntity, BaseRepository } from './repository.interface';

export interface Location extends BaseEntity {
  id: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  address?: string;
  timestamp: Date;
  isEncrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLocationData {
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  address?: string;
  timestamp: Date;
  isEncrypted?: boolean;
}

export interface LocationRepository extends BaseRepository<Location> {
  findByDevice(
    deviceId: string,
    paginationOptions: { page: number; limit: number },
    filterOptions?: {
      startDate?: Date;
      endDate?: Date;
      minAccuracy?: number;
    }
  ): Promise<{
    data: Location[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>;

  findCurrentByDevice(deviceId: string): Promise<Location | null>;
}

