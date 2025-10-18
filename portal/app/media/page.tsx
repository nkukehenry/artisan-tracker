'use client';

import { useState } from 'react';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { useDevices } from '@/hooks/useDevices';
import { useMedia } from '@/hooks/useMedia';
import DataTable from '@/components/ui/DataTable';
import SearchFilter from '@/components/ui/SearchFilter';
import Select from '@/components/ui/Select';
import LocationBadge from '@/components/ui/LocationBadge';
import { Media, formatFileSize } from '@/types/media';
import { FileAudio, FileImage, FileVideo, FileText, Phone, Trash2, Eye } from 'lucide-react';
import MediaViewerModal from '@/components/media/MediaViewerModal';
import { useAppDispatch } from '@/lib/hooks';
import { addToast } from '@/store/slices/appSlice';

export default function MediaPage() {
  const dispatch = useAppDispatch();
  const { devices } = useDevices();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  const {
    mediaFiles,
    isLoading,
    error,
    filters,
    updateFilters,
    deleteMedia,
    downloadMedia,
    setSelectedDevice,
    selectedDevice,
  } = useMedia();

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setSelectedDevice(deviceId || null);
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (window.confirm('Are you sure you want to delete this media file?')) {
      try {
        await deleteMedia(mediaId);
        dispatch(addToast({
          type: 'success',
          title: 'Media Deleted',
          message: 'Media file deleted successfully',
        }));
      } catch (err) {
        dispatch(addToast({
          type: 'error',
          title: 'Delete Failed',
          message: err instanceof Error ? err.message : 'Failed to delete media file',
        }));
      }
    }
  };

  const handleDownloadMedia = async (mediaId: string, fileName: string) => {
    try {
      await downloadMedia(mediaId, fileName);
      dispatch(addToast({
        type: 'success',
        title: 'Download Started',
        message: 'Media file download started',
      }));
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        title: 'Download Failed',
        message: err instanceof Error ? err.message : 'Failed to download media file',
      }));
    }
  };

  const handleViewMedia = (media: Media) => {
    setSelectedMedia(media);
    setIsViewerModalOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerModalOpen(false);
    setSelectedMedia(null);
  };

  const handleDeleteFromViewer = async (mediaId: string) => {
    try {
      await deleteMedia(mediaId);
      dispatch(addToast({
        type: 'success',
        title: 'Media Deleted',
        message: 'Media file deleted successfully',
      }));
      handleCloseViewer();
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err instanceof Error ? err.message : 'Failed to delete media file',
      }));
    }
  };

  const getMediaIcon = (fileType: string) => {
    switch (fileType) {
      case 'AUDIO':
        return <FileAudio className="h-5 w-5 text-green-600" />;
      case 'PHOTO':
        return <FileImage className="h-5 w-5 text-purple-600" />;
      case 'VIDEO':
        return <FileVideo className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };


  const columns = [
    {
      key: 'fileType',
      label: 'Type',
      sortable: true,
      render: (item: Media, value: unknown) => (
        <div className="flex items-center gap-2">
          {getMediaIcon(value as string)}
          <span className="text-sm font-medium">{value as string}</span>
        </div>
      ),
    },
    {
      key: 'fileName',
      label: 'File Name',
      sortable: true,
      render: (item: Media, value: unknown) => (
        <div className="space-y-1">
          <div className="font-medium truncate max-w-[200px]" title={value as string}>
            {value as string}
          </div>
          <div className="text-xs text-gray-500">
            {formatFileSize(item.fileSize)}
          </div>
          {(() => {
            const hasLocation = item.location && typeof item.location === 'string';
            const hasGPS = item.gpsCoordinates && typeof item.gpsCoordinates === 'string';
            if (hasLocation || hasGPS) {
              return (
                <LocationBadge 
                  location={hasLocation ? item.location as string : undefined} 
                  gpsCoordinates={hasGPS ? item.gpsCoordinates as string : undefined} 
                />
              );
            }
            return null;
          })()}
        </div>
      ),
    },
    {
      key: 'call',
      label: 'Related Call',
      sortable: false,
      render: (item: Media, value: unknown) => {
        if (!item.call) return <span className="text-gray-400 text-sm">-</span>;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">
                {item.call.contactName || item.call.phoneNumber}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {item.call.callType} • {Math.floor(item.call.duration / 60)}:{(item.call.duration % 60).toString().padStart(2, '0')}
            </div>
            {(() => {
              const hasLocation = item.call.location && typeof item.call.location === 'string';
              const hasGPS = item.call.gpsCoordinates && typeof item.call.gpsCoordinates === 'string';
              if (hasLocation || hasGPS) {
                return (
                  <LocationBadge 
                    location={hasLocation ? item.call.location as string : undefined} 
                    gpsCoordinates={hasGPS ? item.call.gpsCoordinates as string : undefined} 
                  />
                );
              }
              return null;
            })()}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Date & Time',
      sortable: true,
      render: (item: Media, value: unknown) => (
        <div className="text-sm">
          {new Date(value as string).toLocaleString()}
        </div>
      ),
    },
    {
      key: 'isEncrypted',
      label: 'Security',
      sortable: true,
      render: (item: Media, value: unknown) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          (value as boolean) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {(value as boolean) ? 'Encrypted' : 'Plain'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (item: Media) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewMedia(item)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDownloadMedia(item.id, item.fileName)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Download"
          >
            <FileText className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteMedia(item.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const fileTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'PHOTO', label: 'Photos' },
    { value: 'VIDEO', label: 'Videos' },
    { value: 'AUDIO', label: 'Audio' },
    { value: 'DOCUMENT', label: 'Documents' },
  ];

  const deviceOptions = [
    { value: '', label: 'Select a device' },
    ...devices.map(device => ({
      value: device.deviceId,
      label: device.name,
    })),
  ];

  return (
    <AuthWrapper>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Media Files</h1>
              <p className="text-gray-600">View photos, videos, and audio files from your devices</p>
            </div>
          </div>

          {/* Device Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Device:</label>
              <Select
                options={deviceOptions}
                value={selectedDeviceId}
                onChange={handleDeviceChange}
                placeholder="Select a device"
                className="min-w-[200px]"
              />
            </div>
          </div>

          {/* Filters */}
          {selectedDevice && (
            <SearchFilter
              searchValue=""
              onSearchChange={() => {}}
              searchPlaceholder="Search media files..."
              filterValue={filters.fileType || ''}
              onFilterChange={(value) => updateFilters({ fileType: value as 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | undefined })}
              filterOptions={fileTypeOptions}
              filterLabel="File Type"
            />
          )}

          {/* Loading State */}
          {isLoading && mediaFiles.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading media files...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : !selectedDevice ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <p className="text-gray-600">Please select a device to view media files</p>
              </div>
            </div>
          ) : (
            /* Media Files Table */
            <DataTable
              data={mediaFiles}
              columns={columns}
              emptyMessage="No media files found"
            />
          )}
        </div>

        {/* Media Viewer Modal */}
        <MediaViewerModal
          isOpen={isViewerModalOpen}
          onClose={handleCloseViewer}
          media={selectedMedia}
          onDelete={handleDeleteFromViewer}
        />
      </Layout>
    </AuthWrapper>
  );
}

