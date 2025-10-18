'use client';

import { useState, useEffect } from 'react';
import { X, Download, Trash2, FileAudio, FileImage, FileVideo, FileText, MapPin, Clock, Shield } from 'lucide-react';
import { Media } from '@/types/media';
import { useAppDispatch } from '@/lib/hooks';
import { addToast } from '@/store/slices/appSlice';
import { mediaApi } from '@/lib/mediaApi';
import apiClient from '@/lib/api';
import LocationBadge from '@/components/ui/LocationBadge';

export interface MediaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: Media | null;
  onDelete?: (mediaId: string) => void;
}

export default function MediaViewerModal({ isOpen, onClose, media, onDelete }: MediaViewerModalProps) {
  const dispatch = useAppDispatch();
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && media) {
      loadMediaFile();
    } else {
      // Clean up object URL when modal closes
      if (mediaUrl) {
        URL.revokeObjectURL(mediaUrl);
        setMediaUrl('');
      }
    }
  }, [isOpen, media]);

  const loadMediaFile = async () => {
    if (!media) return;

    setIsLoading(true);
    setError('');

    try {
      // Use apiClient which handles authentication automatically
      const response = await apiClient.get(`/media/view/${media.id}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: media.mimeType });
      const url = URL.createObjectURL(blob);
      setMediaUrl(url);
    } catch (err) {
      console.error('Error loading media file:', err);
      setError('Failed to load media file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!media) return;

    try {
      const result = await mediaApi.downloadMediaFile(media.id);
      
      if (result.success && result.data) {
        // Create download link
        const url = window.URL.createObjectURL(result.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = media.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        dispatch(addToast({
          type: 'success',
          title: 'Download Started',
          message: 'Media file download started',
        }));
      } else {
        throw new Error(result.error?.message || 'Failed to download media file');
      }
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        title: 'Download Failed',
        message: err instanceof Error ? err.message : 'Failed to download media file',
      }));
    }
  };

  const handleDelete = async () => {
    if (!media || !onDelete) return;

    if (window.confirm('Are you sure you want to delete this media file?')) {
      try {
        await mediaApi.deleteMediaFile(media.id);
        dispatch(addToast({
          type: 'success',
          title: 'Media Deleted',
          message: 'Media file deleted successfully',
        }));
        onDelete(media.id);
        onClose();
      } catch (err) {
        dispatch(addToast({
          type: 'error',
          title: 'Delete Failed',
          message: err instanceof Error ? err.message : 'Failed to delete media file',
        }));
      }
    }
  };

  const getMediaIcon = (fileType: string) => {
    switch (fileType) {
      case 'AUDIO':
        return <FileAudio className="h-6 w-6 text-green-600" />;
      case 'PHOTO':
        return <FileImage className="h-6 w-6 text-purple-600" />;
      case 'VIDEO':
        return <FileVideo className="h-6 w-6 text-red-600" />;
      default:
        return <FileText className="h-6 w-6 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: string | number): string => {
    const numBytes = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (numBytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    return Math.round(numBytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isOpen || !media) return null;

  return (
    <div className="fixed inset-0 bg-blue-900/20 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl w-[70vw] h-[60vh] mx-4 border border-white/20 flex flex-col" style={{ maxHeight: '80vh' }}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getMediaIcon(media.fileType)}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{media.fileName}</h2>
              <p className="text-sm text-gray-600">
                {formatFileSize(media.fileSize)} • {media.fileType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Media Content */}
          <div className="mb-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading media file...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
                <div className="text-center">
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={loadMediaFile}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : mediaUrl ? (
              <div className="bg-gray-50 rounded-lg p-4">
                {media.fileType === 'PHOTO' && (
                  <img
                    src={mediaUrl}
                    alt={media.fileName}
                    className="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-sm"
                  />
                )}
                {media.fileType === 'VIDEO' && (
                  <video
                    src={mediaUrl}
                    controls
                    className="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-sm"
                  />
                )}
                {media.fileType === 'AUDIO' && (
                  <div className="text-center">
                    <audio
                      src={mediaUrl}
                      controls
                      className="w-full max-w-md mx-auto"
                    />
                  </div>
                )}
                {media.fileType === 'DOCUMENT' && (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Document preview not available</p>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Download Document
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Media Details */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">File Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">File Name:</span>
                  <span className="text-sm font-medium">{media.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">File Size:</span>
                  <span className="text-sm font-medium">{formatFileSize(media.fileSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">MIME Type:</span>
                  <span className="text-sm font-medium">{media.mimeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Security:</span>
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">
                      {media.isEncrypted ? 'Encrypted' : 'Plain'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Timestamps</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm font-medium">
                    {new Date(media.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Updated:</span>
                  <span className="text-sm font-medium">
                    {new Date(media.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          {((media.location && typeof media.location === 'string') || (media.gpsCoordinates && typeof media.gpsCoordinates === 'string')) && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
              <LocationBadge 
                location={typeof media.location === 'string' ? media.location : undefined} 
                gpsCoordinates={typeof media.gpsCoordinates === 'string' ? media.gpsCoordinates : undefined} 
              />
            </div>
          )}

          {/* Related Call Information */}
          {media.call && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Related Call</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{media.call.contactName || media.call.phoneNumber}</span>
                  <span className="text-sm text-gray-600">{media.call.callType}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{Math.floor(media.call.duration / 60)}:{(media.call.duration % 60).toString().padStart(2, '0')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(media.call.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                {((media.call.location && typeof media.call.location === 'string') || (media.call.gpsCoordinates && typeof media.call.gpsCoordinates === 'string')) && (
                  <div className="mt-2">
                    <LocationBadge 
                      location={typeof media.call.location === 'string' ? media.call.location : undefined} 
                      gpsCoordinates={typeof media.call.gpsCoordinates === 'string' ? media.call.gpsCoordinates : undefined} 
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
