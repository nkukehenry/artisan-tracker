'use client';

import { X, Phone, Clock, MapPin, FileAudio } from 'lucide-react';
import { CallLog } from '@/types/callLog';
import GPSMapViewer from '@/components/ui/GPSMapViewer';
import MediaBadge from '@/components/ui/MediaBadge';

interface CallLogDetailModalProps {
  callLog: CallLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CallLogDetailModal({ callLog, isOpen, onClose }: CallLogDetailModalProps) {
  if (!isOpen || !callLog) return null;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallTypeColor = (callType: string) => {
    switch (callType) {
      case 'INCOMING':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'OUTGOING':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'MISSED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-blue-900/20 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${callLog.callType === 'INCOMING' ? 'bg-green-100 dark:bg-green-900/30' :
                callLog.callType === 'OUTGOING' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  'bg-red-100 dark:bg-red-900/30'
                }`}>
                <Phone className={`h-5 w-5 ${callLog.callType === 'INCOMING' ? 'text-green-600 dark:text-green-400' :
                  callLog.callType === 'OUTGOING' ? 'text-blue-600 dark:text-blue-400' :
                    'text-red-600 dark:text-red-400'
                  }`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Call Details</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {callLog.contactName || callLog.phoneNumber}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone Number</p>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">{callLog.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Contact Name</p>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {callLog.contactName || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Call Type</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getCallTypeColor(callLog.callType)}`}>
                  {callLog.callType}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Duration</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {formatDuration(callLog.duration)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date & Time</p>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {new Date(callLog.timestamp).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Direction</p>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {callLog.isIncoming ? 'Incoming' : 'Outgoing'}
                </p>
              </div>
            </div>

            {/* Media Information */}
            {callLog.media && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <FileAudio className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  Associated Media
                </h3>
                <MediaBadge media={callLog.media} showSize={true} className="w-full" />
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">File Type:</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{callLog.media.fileType}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">MIME Type:</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{callLog.media.mimeType}</p>
                  </div>
                  {callLog.media.isEncrypted !== undefined && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Security:</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {callLog.media.isEncrypted ? 'Encrypted' : 'Not Encrypted'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location Information */}
            {(callLog.location || callLog.gpsCoordinates) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  Location
                </h3>
                <GPSMapViewer
                  location={callLog.location}
                  gpsCoordinates={callLog.gpsCoordinates}
                />

              </div>
            )}

            {/* Timestamps */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Record Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Created At:</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{new Date(callLog.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Updated At:</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{new Date(callLog.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

