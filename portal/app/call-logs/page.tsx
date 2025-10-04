'use client';

import { useState } from 'react';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { useCallLogs } from '@/hooks/useCallLogs';
import { useDevices } from '@/hooks/useDevices';
import DataTable from '@/components/ui/DataTable';
import SearchFilter from '@/components/ui/SearchFilter';
import Select from '@/components/ui/Select';
import { CallLog } from '@/types/callLog';

export default function CallLogsPage() {
  const { devices } = useDevices();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  const {
    callLogs,
    isLoading,
    error,
    filters,
    updateFilters,
  } = useCallLogs(selectedDeviceId);

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    updateFilters(newFilters);
  };

  const columns = [
    {
      key: 'phoneNumber',
      label: 'Phone Number',
      sortable: true,
    },
    {
      key: 'contactName',
      label: 'Contact Name',
      sortable: true,
    },
    {
      key: 'callType',
      label: 'Type',
      sortable: true,
      render: (item: CallLog, value: unknown) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          (value as string) === 'INCOMING' ? 'bg-green-100 text-green-800' :
          (value as string) === 'OUTGOING' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value as string}
        </span>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      sortable: true,
      render: (item: CallLog, value: unknown) => {
        const minutes = Math.floor((value as number) / 60);
        const seconds = (value as number) % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      },
    },
    {
      key: 'timestamp',
      label: 'Date & Time',
      sortable: true,
      render: (item: CallLog, value: unknown) => new Date(value as string).toLocaleString(),
    },
  ];

  const callTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'INCOMING', label: 'Incoming' },
    { value: 'OUTGOING', label: 'Outgoing' },
    { value: 'MISSED', label: 'Missed' },
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
              <h1 className="text-2xl font-bold text-gray-900">Call Logs</h1>
              <p className="text-gray-600">View call history for your devices</p>
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
              searchPlaceholder="Search call logs..."
              filterValue={filters.callType || ''}
              onFilterChange={(value) => handleFilterChange({ callType: value as 'INCOMING' | 'OUTGOING' | 'MISSED' })}
              filterOptions={callTypeOptions}
              filterLabel="Call Type"
            />
          )}

          {/* Loading State */}
          {isLoading && callLogs.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading call logs...</p>
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
                <p className="text-gray-600">Please select a device to view call logs</p>
              </div>
            </div>
          ) : (
            /* Call Logs Table */
            <DataTable
              data={callLogs}
              columns={columns}
              emptyMessage="No call logs found"
            />
          )}
        </div>
      </Layout>
    </AuthWrapper>
  );
}
