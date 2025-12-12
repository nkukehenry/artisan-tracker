'use client';

import { useState } from 'react';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { useCallLogs } from '@/hooks/useCallLogs';
import { useDeviceContext } from '@/contexts/DeviceContext';
import DataTable from '@/components/ui/DataTable';
import SearchFilter from '@/components/ui/SearchFilter';
import LocationBadge from '@/components/ui/LocationBadge';
import MediaBadge from '@/components/ui/MediaBadge';
import CallLogDetailModal from '@/components/call-logs/CallLogDetailModal';
import SelectedDeviceInfo from '@/components/devices/SelectedDeviceInfo';
import { CallLog } from '@/types/callLog';
import { Eye, Phone } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function CallLogsPage() {
  const { selectedDevice } = useDeviceContext();
  const [selectedCallLog, setSelectedCallLog] = useState<CallLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    callLogs,
    isLoading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    changeLimit,
  } = useCallLogs();

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    updateFilters(newFilters);
  };

  const handleViewDetails = (callLog: CallLog) => {
    setSelectedCallLog(callLog);
    setIsDetailModalOpen(true);
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
      render: (item: CallLog, value: unknown) => (
        <div className="space-y-1">
          <div>{value as string || 'Unknown'}</div>
          {(item.location || item.gpsCoordinates) && (
            <LocationBadge location={item.location} gpsCoordinates={item.gpsCoordinates} />
          )}
        </div>
      ),
    },
    {
      key: 'callType',
      label: 'Type',
      sortable: true,
      render: (item: CallLog, value: unknown) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${(value as string) === 'INCOMING' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
          (value as string) === 'OUTGOING' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
            'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
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
        if (item.duration === null || item.duration === undefined) return '0:00';

        const minutes = Math.floor((value as number) / 60);
        const seconds = (value as number) % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      },
    },
    {
      key: 'createdAt',
      label: 'Date & Time',
      sortable: true,
      render: (item: CallLog, value: unknown) => (
        <div className="space-y-1">
          <div>{formatDateTime(value as string)}</div>
          {item.media && (
            <MediaBadge media={item.media} showSize={false} />
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (item: CallLog) => (
        <button
          onClick={() => handleViewDetails(item)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
        >
          <Eye className="h-4 w-4" />
          View
        </button>
      ),
    },
  ];

  const callTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'INCOMING', label: 'Incoming' },
    { value: 'OUTGOING', label: 'Outgoing' },
    { value: 'MISSED', label: 'Missed' },
  ];

  if (!selectedDevice) {
    return (
      <AuthWrapper>
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <Phone className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Device Selected</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please select a device from the dropdown in the header to view call logs.
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Call Logs</h1>
              <p className="text-gray-600 dark:text-gray-400">View call history for {selectedDevice.name}</p>
            </div>
          </div>

          {/* Selected Device Info */}
          <SelectedDeviceInfo device={selectedDevice} />

          {/* Filters */}
          <SearchFilter
            searchValue=""
            onSearchChange={() => { }}
            searchPlaceholder="Search call logs..."
            filterValue={filters.callType || ''}
            onFilterChange={(value) => handleFilterChange({ callType: value as 'INCOMING' | 'OUTGOING' | 'MISSED' })}
            filterOptions={callTypeOptions}
            filterLabel="Call Type"
          />

          {/* Loading State */}
          {isLoading && callLogs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading call logs...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12">
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          ) : (
            /* Call Logs Table */
            <DataTable
              data={callLogs}
              columns={columns}
              emptyMessage="No call logs found"
              pagination={pagination || undefined}
              onPageChange={changePage}
              onLimitChange={changeLimit}
            />
          )}

          {/* Call Log Detail Modal */}
          <CallLogDetailModal
            callLog={selectedCallLog}
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
          />
        </div>
      </Layout>
    </AuthWrapper>
  );
}
