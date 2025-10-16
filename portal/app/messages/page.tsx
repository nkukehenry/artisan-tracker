'use client';

import { useState } from 'react';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { useMessages } from '@/hooks/useMessages';
import { useDeviceContext } from '@/contexts/DeviceContext';
import DataTable from '@/components/ui/DataTable';
import SearchFilter from '@/components/ui/SearchFilter';
import LocationBadge from '@/components/ui/LocationBadge';
import { Message } from '@/types/message';
import { Smartphone } from 'lucide-react';

export default function MessagesPage() {
  const { selectedDevice } = useDeviceContext();

  const {
    messages,
    isLoading,
    error,
    filters,
    updateFilters,
  } = useMessages();

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    updateFilters(newFilters);
  };

  const columns = [
    {
      key: 'messageType',
      label: 'Type',
      sortable: true,
      render: (item: Message, value: unknown) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${(value as string) === 'SMS' ? 'bg-blue-100 text-blue-800' :
            (value as string) === 'WHATSAPP' ? 'bg-green-100 text-green-800' :
              'bg-purple-100 text-purple-800'
          }`}>
          {value as string}
        </span>
      ),
    },
    {
      key: 'sender',
      label: 'From',
      sortable: true,
    },
    {
      key: 'recipient',
      label: 'To',
      sortable: true,
    },
    {
      key: 'content',
      label: 'Message',
      sortable: false,
      render: (item: Message, value: unknown) => (
        <div className="space-y-1">
          <div className="max-w-xs truncate" title={value as string}>
            {value as string}
          </div>
          {(item.location || item.gpsCoordinates) && (
            <LocationBadge location={item.location} gpsCoordinates={item.gpsCoordinates} />
          )}
        </div>
      ),
    },
    {
      key: 'timestamp',
      label: 'Date & Time',
      sortable: true,
      render: (item: Message, value: unknown) => new Date(value as string).toLocaleString(),
    },
    {
      key: 'isRead',
      label: 'Status',
      sortable: true,
      render: (item: Message, value: unknown) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${(value as boolean) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
          {(value as boolean) ? 'Read' : 'Unread'}
        </span>
      ),
    },
  ];

  const messageTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'SMS', label: 'SMS' },
    { value: 'WHATSAPP', label: 'WhatsApp' },
    { value: 'TELEGRAM', label: 'Telegram' },
  ];

  if (!selectedDevice) {
    return (
      <AuthWrapper>
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <Smartphone className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Device Selected</h2>
            <p className="text-gray-600 mb-6">
              Please select a device from the dropdown in the header to view messages.
            </p>
          </div>
        </Layout>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">View message history for {selectedDevice.name}</p>
            </div>
          </div>

          {/* Selected Device Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${selectedDevice.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <div className="font-medium text-gray-900">{selectedDevice.name}</div>
                <div className="text-sm text-gray-500">{selectedDevice.deviceId} • {selectedDevice.model}</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <SearchFilter
            searchValue=""
            onSearchChange={() => { }}
            searchPlaceholder="Search messages..."
            filterValue={filters.messageType || ''}
            onFilterChange={(value) => handleFilterChange({ messageType: value as 'SMS' | 'WHATSAPP' | 'TELEGRAM' })}
            filterOptions={messageTypeOptions}
            filterLabel="Message Type"
          />

          {/* Loading State */}
          {isLoading && messages.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading messages...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : (
            /* Messages Table */
            <DataTable
              data={messages}
              columns={columns}
              emptyMessage="No messages found"
            />
          )}
        </div>
      </Layout>
    </AuthWrapper>
  );
}
