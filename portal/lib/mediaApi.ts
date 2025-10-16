import apiClient from './api';
import { handleApiError } from './api';
import { AxiosError } from 'axios';
import { MediaResponse, MediaFilters } from '@/types/media';
import { sanitizeFileName, getFileExtension } from './downloadUtils';

/**
 * Get media files for a specific device
 */
export const getMediaFiles = async (
  deviceId: string,
  filters?: MediaFilters
): Promise<{ success: boolean; data?: MediaResponse; error?: { message: string; status: number; data: unknown } }> => {
  try {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.fileType) params.append('fileType', filters.fileType);
    params.append('sortBy', 'createdAt');
    params.append('sortOrder', 'desc');

    const response = await apiClient.get(`/media/device/${deviceId}?${params.toString()}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? handleApiError(error as AxiosError) : { message: 'An unexpected error occurred', status: 0, data: null },
    };
  }
};

/**
 * Get a specific media file by ID
 */
export const getMediaFile = async (
  mediaId: string
): Promise<{ success: boolean; data?: { success: boolean; data: unknown }; error?: { message: string; status: number; data: unknown } }> => {
  try {
    const response = await apiClient.get(`/media/${mediaId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? handleApiError(error as AxiosError) : { message: 'An unexpected error occurred', status: 0, data: null },
    };
  }
};

/**
 * Download a media file
 */
export const downloadMediaFile = async (
  mediaId: string
): Promise<{ success: boolean; data?: Blob; filename?: string; error?: { message: string; status: number; data: unknown } }> => {
  try {
    const response = await apiClient.get(`/media/download/${mediaId}`, {
      responseType: 'blob',
    });

    // Extract filename from Content-Disposition header if available
    const contentDisposition = response.headers['content-disposition'];
    let filename = `media_${mediaId}`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Sanitize filename and ensure it has proper extension
    const sanitizedFilename = sanitizeFileName(filename);
    const mimeType = response.headers['content-type'];
    const extension = getFileExtension(sanitizedFilename, mimeType);

    // Ensure filename has extension
    const finalFilename = sanitizedFilename.includes('.')
      ? sanitizedFilename
      : `${sanitizedFilename}.${extension}`;

    return {
      success: true,
      data: response.data,
      filename: finalFilename,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? handleApiError(error as AxiosError) : { message: 'An unexpected error occurred', status: 0, data: null },
    };
  }
};

/**
 * Delete a media file
 */
export const deleteMediaFile = async (
  mediaId: string
): Promise<{ success: boolean; data?: { success: boolean; message: string }; error?: { message: string; status: number; data: unknown } }> => {
  try {
    const response = await apiClient.delete(`/media/${mediaId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? handleApiError(error as AxiosError) : { message: 'An unexpected error occurred', status: 0, data: null },
    };
  }
};

export const mediaApi = {
  getMediaFiles,
  getMediaFile,
  downloadMediaFile,
  deleteMediaFile,
};

