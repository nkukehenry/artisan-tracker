import { User, CreateUserData } from './user.interface';
import { Tenant, CreateTenantData } from './tenant.interface';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantName: string;
  domain: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface UserWithTokens {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface IAuthService {
  register(data: RegisterRequest): Promise<UserWithTokens>;
  login(email: string, password: string): Promise<UserWithTokens>;
  refreshToken(token: string): Promise<{ accessToken: string; newRefreshToken: string }>;
  logout(refreshToken: string): Promise<void>;
  getProfile(userId: string): Promise<User | null>;
}
