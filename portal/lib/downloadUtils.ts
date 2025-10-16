/**
 * Enhanced download utility for media files
 * Handles different file types and provides better user feedback
 */

export interface DownloadOptions {
    mediaId: string;
    fileName?: string;
    fileType?: string;
    mimeType?: string;
}

export const downloadFile = async (
    blob: Blob,
    fileName: string,
    mimeType?: string
): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            // Create object URL
            const url = window.URL.createObjectURL(blob);

            // Create download link
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;

            // Add to DOM temporarily
            document.body.appendChild(link);

            // Trigger download
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

export const getFileExtension = (fileName: string, mimeType?: string): string => {
    // Try to get extension from filename first
    const fileNameExt = fileName.split('.').pop()?.toLowerCase();
    if (fileNameExt && fileNameExt.length <= 4) {
        return fileNameExt;
    }

    // Fallback to mime type
    if (mimeType) {
        const mimeToExt: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'video/mp4': 'mp4',
            'video/avi': 'avi',
            'video/mov': 'mov',
            'video/wmv': 'wmv',
            'audio/mp3': 'mp3',
            'audio/wav': 'wav',
            'audio/m4a': 'm4a',
            'application/pdf': 'pdf',
            'text/plain': 'txt',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        };

        return mimeToExt[mimeType] || 'bin';
    }

    return 'bin';
};

export const sanitizeFileName = (fileName: string): string => {
    // Remove or replace invalid characters
    return fileName
        .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters with underscore
        .replace(/\s+/g, '_') // Replace spaces with underscore
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
};
