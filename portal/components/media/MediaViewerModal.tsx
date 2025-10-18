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
      if (result.success) {
        dispatch(addToast({
          type: 'success',
          title: 'Download Success',
          message: 'Media file downloaded successfully'
        }));
      } else {
        dispatch(addToast({
          type: 'error',
          title: 'Download Failed',
          message: result.error?.message || 'Failed to download media file'
        }));
      }
    } catch (err) {
      console.error('Error downloading media file:', err);
      dispatch(addToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download media file'
      }));
    }
  };

  const handleDelete = async () => {
    if (!media || !onDelete) return;

    try {
      await mediaApi.deleteMediaFile(media.id);
      dispatch(addToast({
        type: 'success',
        title: 'Delete Success',
        message: 'Media file deleted successfully'
      }));
      onDelete(media.id);
      onClose();
    } catch (err) {
      console.error('Error deleting media file:', err);
      dispatch(addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete media file'
      }));
    }
  };

  const getMediaIcon = (fileType: string) => {
    switch (fileType) {
      case 'PHOTO':
        return <FileImage className="h-5 w-5 text-green-600" />;
      case 'VIDEO':
        return <FileVideo className="h-5 w-5 text-purple-600" />;
      case 'AUDIO':
        return <FileAudio className="h-5 w-5 text-blue-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isOpen || !media) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-blue-900/20 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                media.fileType === 'PHOTO' ? 'bg-green-100' :
                media.fileType === 'VIDEO' ? 'bg-purple-100' :
                media.fileType === 'AUDIO' ? 'bg-blue-100' :
                'bg-gray-100'
              }`}>
                {getMediaIcon(media.fileType)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Media Details</h2>
                <p className="text-sm text-gray-600">
                  {media.fileType} • {formatFileSize(Number(media.fileSize))}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">File Name</p>
                <p className="text-base font-medium text-gray-900">{media.fileName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">File Type</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  media.fileType === 'PHOTO' ? 'bg-green-100 text-green-800' :
                  media.fileType === 'VIDEO' ? 'bg-purple-100 text-purple-800' :
                  media.fileType === 'AUDIO' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {media.fileType}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">File Size</p>
                <p className="text-base font-medium text-gray-900">{formatFileSize(Number(media.fileSize))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">MIME Type</p>
                <p className="text-base font-medium text-gray-900">{media.mimeType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Security</p>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <p className="text-base font-medium text-gray-900">
                    {media.isEncrypted ? 'Encrypted' : 'Not Encrypted'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Created At</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <p className="text-base font-medium text-gray-900">
                    {new Date(media.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Media Content */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Media Preview</h3>
              {isLoading ? (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading media file...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-red-600">{error}</p>
                    <button
                      onClick={loadMediaFile}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : mediaUrl ? (
                <div className="space-y-4">
                  {media.fileType === 'PHOTO' && (
                    <div className="flex justify-center">
                      <img
                        src={mediaUrl}
                        alt={media.fileName}
                        className="max-w-full max-h-96 rounded-lg shadow-lg"
                      />
                    </div>
                  )}
                  {media.fileType === 'VIDEO' && (
                    <div className="flex justify-center">
                      <video
                        src={mediaUrl}
                        controls
                        className="max-w-full max-h-96 rounded-lg shadow-lg"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  {media.fileType === 'AUDIO' && (
                    <div className="flex justify-center">
                      <audio
                        src={mediaUrl}
                        controls
                        className="w-full max-w-md"
                      >
                        Your browser does not support the audio tag.
                      </audio>
                    </div>
                  )}
                  {media.fileType === 'DOCUMENT' && (
                    <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
                      <FileText className="h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">Document preview not available</p>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download Document
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Location Information */}
            {((media.location && typeof media.location === 'string') || (media.gpsCoordinates && typeof media.gpsCoordinates === 'string')) && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  Location
                </h3>
                <LocationBadge 
                  location={typeof media.location === 'string' ? media.location : undefined} 
                  gpsCoordinates={typeof media.gpsCoordinates === 'string' ? media.gpsCoordinates : undefined} 
                />
              </div>
            )}

            {/* Related Call Information */}
            {media.call && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Related Call</h3>
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

            {/* Timestamps */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Record Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Created At:</p>
                  <p className="font-medium">{new Date(media.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Updated At:</p>
                  <p className="font-medium">{new Date(media.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
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
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}