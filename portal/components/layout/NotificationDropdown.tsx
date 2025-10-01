'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Settings } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Device Online',
    message: 'iPhone 14 Pro is now online',
    time: '2 minutes ago',
    unread: true,
  },
  {
    id: '2',
    title: 'New Location Update',
    message: 'Samsung Galaxy S23 location updated',
    time: '5 minutes ago',
    unread: true,
  },
  {
    id: '3',
    title: 'Command Executed',
    message: 'Take photo command completed successfully',
    time: '10 minutes ago',
    unread: false,
  },
  {
    id: '4',
    title: 'Device Offline',
    message: 'iPad Pro went offline',
    time: '1 hour ago',
    unread: false,
  },
  {
    id: '5',
    title: 'System Update',
    message: 'New system update available',
    time: '2 hours ago',
    unread: false,
  },
];

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = mockNotifications.filter(n => n.unread).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAllRead = () => {
    // TODO: Implement mark all as read
    console.log('Mark all as read');
    setIsOpen(false);
  };

  const handleNotificationSettings = () => {
    // TODO: Navigate to notification settings
    console.log('Open notification settings');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        aria-label="View notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 right-0 rounded-lg bg-white shadow-lg border border-gray-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              <span className="text-xs text-gray-500">{unreadCount} unread</span>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {mockNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                  notification.unread ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    notification.unread ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <button 
                onClick={handleMarkAllRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all as read
              </button>
              <button 
                onClick={handleNotificationSettings}
                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
