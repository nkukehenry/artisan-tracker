'use client';

import { useState } from 'react';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { useLocation } from '@/hooks/useLocation';
import { useDevices } from '@/hooks/useDevices';
import DataTable from '@/components/ui/DataTable';
import Select from '@/components/ui/Select';
import { Location } from '@/types/location';
import { MapPin, Clock, Navigation } from 'lucide-react';

export default function LocationPage() {
  const { devices } = useDevices();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  const {
    locationHistory,
    currentLocation,
    isLoading,
    currentLocationLoading,
    error,
    loadCurrent,
  } = useLocation(selectedDeviceId);

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
  };

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
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="truncate" title={(value as string) || `${item.latitude}, ${item.longitude}`}>
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
        <span className="font-mono text-sm">
          {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
        </span>
      ),
    },
    {
      key: 'accuracy',
      label: 'Accuracy',
      sortable: true,
      render: (item: Location, value: unknown) => (
        <span className="text-sm">
          {(value as number).toFixed(1)}m
        </span>
      ),
    },
    {
      key: 'speed',
      label: 'Speed',
      sortable: true,
      render: (item: Location, value: unknown) => (
        <span className="text-sm">
          {(value as number) ? `${(value as number).toFixed(1)} m/s` : '-'}
        </span>
      ),
    },
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
              <h1 className="text-2xl font-bold text-gray-900">Location History</h1>
              <p className="text-gray-600">View location data for your devices</p>
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

          {/* Current Location */}
          {selectedDeviceId && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Current Location
                </h3>
                <button
                  onClick={handleRefreshCurrentLocation}
                  disabled={currentLocationLoading}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {currentLocationLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              
              {currentLocationLoading ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Loading current location...
                </div>
              ) : currentLocation ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">
                        {currentLocation.address || `${currentLocation.latitude}, ${currentLocation.longitude}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-medium">
                        {new Date(currentLocation.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-600">Accuracy</p>
                      <p className="font-medium">{currentLocation.accuracy.toFixed(1)}m</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No current location data available</p>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && locationHistory.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading location history...</p>
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
                <p className="text-gray-600">Please select a device to view location history</p>
              </div>
            </div>
          ) : (
            /* Location History Table */
            <DataTable
              data={locationHistory}
              columns={columns}
              emptyMessage="No location history found"
            />
          )}
        </div>
      </Layout>
    </AuthWrapper>
  );
}
