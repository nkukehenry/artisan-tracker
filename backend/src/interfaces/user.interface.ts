import { BaseRepository } from './repository.interface';

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'USER';
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'USER';
  isActive?: boolean;
  tenantId: string;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'USER';
  isActive?: boolean;
  lastLoginAt?: Date;
}

export interface UserRepository extends BaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByTenant(tenantId: string, options?: { page?: number; limit?: number }): Promise<{ data: User[]; pagination: any }>;
  findByRole(role: string, tenantId?: string): Promise<User[]>;
  updateLastLogin(id: string): Promise<void>;
  changePassword(id: string, hashedPassword: string): Promise<void>;
  deactivateUser(id: string): Promise<void>;
  activateUser(id: string): Promise<void>;
}
