'use client';

import { X, MessageSquare, Clock, MapPin, User, Users } from 'lucide-react';
import { Message } from '@/types/message';
import GPSMapViewer from '@/components/ui/GPSMapViewer';

interface MessageDetailModalProps {
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MessageDetailModal({ message, isOpen, onClose }: MessageDetailModalProps) {
  if (!isOpen || !message) return null;

  const getMessageTypeColor = (messageType: string) => {
    switch (messageType) {
      case 'SMS':
        return 'bg-blue-100 text-blue-800';
      case 'WHATSAPP':
        return 'bg-green-100 text-green-800';
      case 'TELEGRAM':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMessageTypeIcon = (messageType: string) => {
    switch (messageType) {
      case 'SMS':
        return '📱';
      case 'WHATSAPP':
        return '💬';
      case 'TELEGRAM':
        return '✈️';
      default:
        return '💬';
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
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                message.messageType === 'SMS' ? 'bg-blue-100' :
                message.messageType === 'WHATSAPP' ? 'bg-green-100' :
                'bg-purple-100'
              }`}>
                <MessageSquare className={`h-5 w-5 ${
                  message.messageType === 'SMS' ? 'text-blue-600' :
                  message.messageType === 'WHATSAPP' ? 'text-green-600' :
                  'text-purple-600'
                }`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Message Details</h2>
                <p className="text-sm text-gray-600">
                  {message.messageType} Message
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
                <p className="text-sm text-gray-500 mb-1">Message Type</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getMessageTypeColor(message.messageType)}`}>
                  {getMessageTypeIcon(message.messageType)} {message.messageType}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${message.isRead ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {message.isRead ? 'Read' : 'Unread'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">From</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <p className="text-base font-medium text-gray-900">{message.sender}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">To</p>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <p className="text-base font-medium text-gray-900">{message.recipient}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <p className="text-base font-medium text-gray-900">
                    {new Date(message.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Conversation</p>
                <p className="text-base font-medium text-gray-900">
                  {message.conversation?.name || 'Individual Message'}
                </p>
              </div>
            </div>

            {/* Message Content */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Message Content</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>

            {/* Location Information */}
            {(message.location || message.gpsCoordinates) && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  Location
                </h3>
                <GPSMapViewer
                  location={message.location}
                  gpsCoordinates={message.gpsCoordinates}
                />
              </div>
            )}

            {/* Conversation Information */}
            {message.conversation && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Conversation Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Conversation Name:</p>
                    <p className="font-medium">{message.conversation.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Participant Count:</p>
                    <p className="font-medium">{message.conversation.participantCount || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Record Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Created At:</p>
                  <p className="font-medium">{new Date(message.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Updated At:</p>
                  <p className="font-medium">{new Date(message.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
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
