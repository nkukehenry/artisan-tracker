export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'USER';
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
    tenantId: string;
}

export interface CreateUserData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'TENANT_ADMIN' | 'USER';
}

export interface UpdateUserData {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: 'TENANT_ADMIN' | 'USER';
    isActive?: boolean;
}

export interface UserListResponse {
    success: boolean;
    message: string;
    data: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface UserResponse {
    success: boolean;
    message: string;
    data: User;
}

export interface UserQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
