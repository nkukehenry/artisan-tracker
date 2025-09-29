import { User } from './user.interface';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantName: string;
  tenantDomain?: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  register(data: RegisterData): Promise<AuthResult>;
  refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
  logout(accessToken: string, refreshToken: string): Promise<void>;
}
