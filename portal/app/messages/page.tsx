'use client';

import { useState } from 'react';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { useMessages } from '@/hooks/useMessages';
import { useDevices } from '@/hooks/useDevices';
import DataTable from '@/components/ui/DataTable';
import SearchFilter from '@/components/ui/SearchFilter';
import Select from '@/components/ui/Select';
import { Message } from '@/types/message';

export default function MessagesPage() {
  const { devices } = useDevices();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  const {
    messages,
    isLoading,
    error,
    filters,
    updateFilters,
  } = useMessages(selectedDeviceId);

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    updateFilters(newFilters);
  };

  const columns = [
    {
      key: 'messageType',
      label: 'Type',
      sortable: true,
      render: (item: Message, value: unknown) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          (value as string) === 'SMS' ? 'bg-blue-100 text-blue-800' :
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
        <div className="max-w-xs truncate" title={value as string}>
          {value as string}
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
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          (value as boolean) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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

  const deviceOptions = [
    { value: '', label: 'Select a device' },
    ...devices.map(device => ({
      value: device.id,
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
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">View message history for your devices</p>
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
          {selectedDeviceId && (
            <SearchFilter
              searchValue=""
              onSearchChange={() => {}}
              searchPlaceholder="Search messages..."
              filterValue={filters.messageType || ''}
              onFilterChange={(value) => handleFilterChange({ messageType: value as 'SMS' | 'WHATSAPP' | 'TELEGRAM' })}
              filterOptions={messageTypeOptions}
              filterLabel="Message Type"
            />
          )}

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
          ) : !selectedDeviceId ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <p className="text-gray-600">Please select a device to view messages</p>
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
