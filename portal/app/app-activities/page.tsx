'use client';

import { useState } from 'react';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { useAppActivity } from '@/hooks/useAppActivity';
import { useDevices } from '@/hooks/useDevices';
import DataTable from '@/components/ui/DataTable';
import SearchFilter from '@/components/ui/SearchFilter';
import Select from '@/components/ui/Select';
import { AppActivity } from '@/types/appActivity';
import { Smartphone, Clock, BarChart3 } from 'lucide-react';

export default function AppActivitiesPage() {
  const { devices } = useDevices();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  const {
    appActivities,
    usageSummary,
    isLoading,
    summaryLoading,
    error,
    filters,
    updateFilters,
    loadSummary,
  } = useAppActivity(selectedDeviceId);

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    updateFilters(newFilters);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const columns = [
    {
      key: 'appName',
      label: 'App Name',
      sortable: true,
      render: (item: AppActivity, value: unknown) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Smartphone className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <p className="font-medium">{value as string}</p>
            <p className="text-xs text-gray-500">{item.packageName}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'usageTime',
      label: 'Usage Time',
      sortable: true,
      render: (item: AppActivity, value: unknown) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="font-mono text-sm">{formatDuration(value as number)}</span>
        </div>
      ),
    },
    {
      key: 'timestamp',
      label: 'Last Used',
      sortable: true,
      render: (item: AppActivity, value: unknown) => new Date(value as string).toLocaleString(),
    },
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
              <h1 className="text-2xl font-bold text-gray-900">App Activities</h1>
              <p className="text-gray-600">View app usage data for your devices</p>
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

          {/* Usage Summary */}
          {selectedDeviceId && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Usage Summary
                </h3>
                <button
                  onClick={loadSummary}
                  disabled={summaryLoading}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {summaryLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              
              {summaryLoading ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Loading usage summary...
                </div>
              ) : usageSummary ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{usageSummary.totalApps}</p>
                    <p className="text-sm text-gray-600">Total Apps</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{formatDuration(usageSummary.totalUsageTime)}</p>
                    <p className="text-sm text-gray-600">Total Usage</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-lg font-semibold text-purple-600 truncate" title={usageSummary.mostUsedApps}>
                      {usageSummary.mostUsedApps || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">Most Used</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No usage summary data available</p>
              )}
            </div>
          )}

          {/* Filters */}
          {selectedDeviceId && (
            <SearchFilter
              searchValue={filters.appName || ''}
              onSearchChange={(value) => handleFilterChange({ appName: value })}
              searchPlaceholder="Search apps..."
              filterValue=""
              onFilterChange={() => {}}
              filterOptions={[]}
              filterLabel=""
            />
          )}

          {/* Loading State */}
          {isLoading && appActivities.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading app activities...</p>
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
                <p className="text-gray-600">Please select a device to view app activities</p>
              </div>
            </div>
          ) : (
            /* App Activities Table */
            <DataTable
              data={appActivities}
              columns={columns}
              emptyMessage="No app activities found"
            />
          )}
        </div>
      </Layout>
    </AuthWrapper>
  );
}
