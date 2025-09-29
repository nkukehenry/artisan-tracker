import { BaseRepository } from './repository.interface';

export interface Tenant {
  id: string;
  name: string;
  domain: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTenantData {
  name: string;
  domain?: string | null;
  isActive?: boolean;
}

export interface UpdateTenantData {
  name?: string;
  domain?: string | null;
  isActive?: boolean;
}

export interface TenantRepository extends BaseRepository<Tenant> {
  findByDomain(domain: string): Promise<Tenant | null>;
  findActiveTenants(): Promise<Tenant[]>;
  deactivateTenant(id: string): Promise<void>;
  activateTenant(id: string): Promise<void>;
}
