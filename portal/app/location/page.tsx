'use client';

import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { useLocation } from '@/hooks/useLocation';
import { useDeviceContext } from '@/contexts/DeviceContext';
import DataTable from '@/components/ui/DataTable';
import { Location } from '@/types/location';
import { MapPin, Clock, Navigation } from 'lucide-react';

export default function LocationPage() {
  const { selectedDevice } = useDeviceContext();

  const {
    locationHistory,
    currentLocation,
    isLoading,
    currentLocationLoading,
    error,
    pagination,
    loadCurrent,
    changePage,
    changeLimit,
  } = useLocation();

  const handleRefreshCurrentLocation = () => {
    loadCurrent();
  };

  const columns = [
    {
      key: 'timestamp',
      label: 'Date & Time',
      sortable: true,
      render: (item: Location, value: unknown) => new Date(value as string).toLocaleString(),
    },
    {
      key: 'address',
      label: 'Address',
      sortable: false,
      render: (item: Location, value: unknown) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <span className="truncate text-gray-900 dark:text-gray-100" title={(value as string) || `${item.latitude}, ${item.longitude}`}>
            {(value as string) || `${item.latitude}, ${item.longitude}`}
          </span>
        </div>
      ),
    },
    {
      key: 'latitude',
      label: 'Coordinates',
      sortable: true,
      render: (item: Location) => (
        <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
          {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
        </span>
      ),
    },
    {
      key: 'accuracy',
      label: 'Accuracy',
      sortable: true,
      render: (item: Location, value: unknown) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {(value as number).toFixed(1)}m
        </span>
      ),
    },
    {
      key: 'speed',
      label: 'Speed',
      sortable: true,
      render: (item: Location, value: unknown) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {(value as number) ? `${(value as number).toFixed(1)} m/s` : '-'}
        </span>
      ),
    },
  ];

  if (!selectedDevice) {
    return (
      <AuthWrapper>
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <MapPin className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Device Selected</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please select a device from the dropdown in the header to view location data.
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Location History</h1>
              <p className="text-gray-600 dark:text-gray-400">View location data for {selectedDevice.name}</p>
            </div>
          </div>

          {/* Selected Device Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${selectedDevice.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{selectedDevice.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{selectedDevice.deviceId} • {selectedDevice.model}</div>
              </div>
            </div>
          </div>

          {/* Current Location */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Current Location
              </h3>
              <button
                onClick={handleRefreshCurrentLocation}
                disabled={currentLocationLoading}
                className="px-3 py-1 text-sm bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
              >
                {currentLocationLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {currentLocationLoading ? (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
                Loading current location...
              </div>
            ) : currentLocation ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {currentLocation.address || `${currentLocation.latitude}, ${currentLocation.longitude}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(currentLocation.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{currentLocation.accuracy.toFixed(1)}m</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No current location data available</p>
            )}
          </div>

          {/* Loading State */}
          {isLoading && locationHistory.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading location history...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12">
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          ) : (
            /* Location History Table */
            <DataTable
              data={locationHistory}
              columns={columns}
              emptyMessage="No location history found"
              pagination={pagination || undefined}
              onPageChange={changePage}
              onLimitChange={changeLimit}
            />
          )}
        </div>
      </Layout>
    </AuthWrapper>
  );
}
