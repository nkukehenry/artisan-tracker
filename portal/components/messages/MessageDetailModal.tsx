'use client';

import { X, Clock, MapPin, User, Users } from 'lucide-react';
import {
  FaSms,
  FaWhatsapp,
  FaTelegram,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaGoogle,
  FaTiktok
} from 'react-icons/fa';
import { Message } from '@/types/message';
import GPSMapViewer from '@/components/ui/GPSMapViewer';
import { formatDateTime } from '@/lib/utils';

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
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'WHATSAPP':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'TELEGRAM':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'FACEBOOK':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'INSTAGRAM':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300';
      case 'TWITTER':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'GMAIL':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'TIKTOK':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
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
      case 'FACEBOOK':
        return '📘';
      case 'INSTAGRAM':
        return '📷';
      case 'TWITTER':
        return '🐦';
      case 'GMAIL':
        return '🔍';
      case 'TIKTOK':
        return '🎵';
      default:
        return '💬';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-blue-900/20 dark:bg-black/50 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${message.messageType === 'SMS' ? 'bg-blue-100 dark:bg-blue-900/30' :
                message.messageType === 'WHATSAPP' ? 'bg-green-100 dark:bg-green-900/30' :
                  message.messageType === 'TELEGRAM' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    message.messageType === 'FACEBOOK' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      message.messageType === 'INSTAGRAM' ? 'bg-pink-100 dark:bg-pink-900/30' :
                        message.messageType === 'TWITTER' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          message.messageType === 'GMAIL' ? 'bg-red-100 dark:bg-red-900/30' :
                            message.messageType === 'TIKTOK' ? 'bg-gray-100 dark:bg-gray-700' :
                              'bg-gray-100 dark:bg-gray-700'
                }`}>
                {getMessageTypeIcon(message.messageType)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Message Details</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {message.messageType} Message
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
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Message Type</p>
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getMessageTypeColor(message.messageType)}`}>
                  {getMessageTypeIcon(message.messageType)}
                  {message.messageType}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${message.isRead ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                  {message.isRead ? 'Read' : 'Unread'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Direction</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${message.isIncoming ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'}`}>
                  {message.isIncoming ? 'Incoming' : 'Outgoing'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">From</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">{message.sender}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">To</p>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">{message.recipient}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date & Time</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {formatDateTime(message.timestamp)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Conversation</p>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {message.conversation?.name || 'Individual Message'}
                </p>
              </div>
            </div>

            {/* Message Content */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Message Content</h3>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>

            {/* Location Information */}
            {(message.location || message.gpsCoordinates) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
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
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Conversation Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Conversation Name:</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{message.conversation.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Participant Count:</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{message.conversation.participantCount || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Record Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Created At:</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(message.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Updated At:</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(message.updatedAt)}</p>
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
