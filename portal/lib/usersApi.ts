import { CreateUserData, UpdateUserData, UserListResponse, UserResponse, UserQueryParams } from '@/types/user';
import apiClient, { handleApiError } from './api';

/**
 * Get all users with optional filtering and pagination
 */
export const getUsers = async (params?: UserQueryParams): Promise<UserListResponse> => {
    try {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.role) queryParams.append('role', params.role);
        if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

        const url = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await apiClient.get<UserListResponse>(url);
        return response.data;
    } catch (error: any) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
    }
};

/**
 * Get a single user by ID
 */
export const getUserById = async (id: string): Promise<UserResponse> => {
    try {
        const response = await apiClient.get<UserResponse>(`/users/${id}`);
        return response.data;
    } catch (error: any) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
    }
};

/**
 * Create a new user
 */
export const createUser = async (data: CreateUserData): Promise<UserResponse> => {
    try {
        const response = await apiClient.post<UserResponse>('/users', data);
        return response.data;
    } catch (error: any) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
    }
};

/**
 * Update an existing user
 */
export const updateUser = async (id: string, data: UpdateUserData): Promise<UserResponse> => {
    try {
        const response = await apiClient.put<UserResponse>(`/users/${id}`, data);
        return response.data;
    } catch (error: any) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
    }
};

/**
 * Deactivate a user (soft delete)
 */
export const deleteUser = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await apiClient.delete<{ success: boolean; message: string }>(`/users/${id}`);
        return response.data;
    } catch (error: any) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
    }
};

/**
 * Activate a user
 */
export const activateUser = async (id: string): Promise<UserResponse> => {
    return updateUser(id, { isActive: true });
};

/**
 * Change password for the authenticated user
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await apiClient.post<{ success: boolean; message: string }>('/auth/change-password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    } catch (error: any) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
    }
};

/**
 * Upgrade user to SUPER_ADMIN role
 */
export const upgradeToSuperAdmin = async (id: string): Promise<UserResponse> => {
    try {
        const response = await apiClient.put<UserResponse>(`/users/${id}/upgrade-super-admin`);
        return response.data;
    } catch (error: any) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
    }
};

/**
 * Reset user password to default
 */
export const resetPassword = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await apiClient.post<{ success: boolean; message: string }>(`/users/${id}/reset-password`);
        return response.data;
    } catch (error: any) {
        const apiError = handleApiError(error);
        throw new Error(apiError.message);
    }
};
