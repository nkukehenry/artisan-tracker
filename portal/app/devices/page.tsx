'use client';

import { useState } from 'react';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { useDeviceContext } from '@/contexts/DeviceContext';
import { useTelemetry } from '@/hooks/useTelemetry';
import {
  Smartphone,
  Battery,
  Wifi,
  MapPin,
  Calendar,
  RefreshCw,
  AlertCircle,
  Thermometer,
  Activity
} from 'lucide-react';
import {
  FaMicrochip,
  FaHdd,
  FaShieldAlt,
  FaSignal
} from 'react-icons/fa';

export default function DeviceInformationPage() {
  const { selectedDevice, refreshDevices } = useDeviceContext();
  const { telemetry, loading: telemetryLoading, error: telemetryError, refetch: refetchTelemetry } = useTelemetry(selectedDevice?.deviceId || null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshDevices(), refetchTelemetry()]);
    setIsRefreshing(false);
  };

  if (!selectedDevice) {
    return (
      <AuthWrapper>
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <Smartphone className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Device Selected</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please select a device from the dropdown in the header to view its information.
            </p>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Devices
            </button>
          </div>
        </Layout>
      </AuthWrapper>
    );
  }

  const getStatusColor = (device: typeof selectedDevice) => {
    if (!device.isActive) return 'bg-gray-500';
    if (device.isOnline) return 'bg-green-500';
    return 'bg-red-500';
  };

  const getStatusText = (device: typeof selectedDevice) => {
    if (!device.isActive) return 'Inactive';
    if (device.isOnline) return 'Online';
    return 'Offline';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };


  const getBatteryStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'charging': return 'text-green-600 dark:text-green-400';
      case 'discharging': return 'text-red-600 dark:text-red-400';
      case 'full': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Helper function to format location
  const formatLocation = (location: unknown): string => {
    if (!location) return 'Not available';
    if (typeof location === 'string') return location;
    if (typeof location === 'object' && location !== null) {
      const loc = location as Record<string, unknown>;
      if (typeof loc.address === 'string') return loc.address;
      if (typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
        return `${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`;
      }
    }
    return 'Not available';
  };


  return (
    <AuthWrapper>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Device Information</h1>
              <p className="text-gray-600 dark:text-gray-400">Detailed information about the selected device</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Show empty state if there's an error and no telemetry */}
          {telemetryError && !telemetry ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <AlertCircle className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Telemetry Data Available</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {telemetryError}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Telemetry data for this device could not be loaded. Please try refreshing or check if the device is online.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Device Status Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Device Status</h2>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedDevice)}`}></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{getStatusText(selectedDevice)}</span>
                    {telemetryLoading && <RefreshCw className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <Battery className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Battery Level</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {telemetry?.batteryPercentage ?
                          `${telemetry.batteryPercentage}` :
                          selectedDevice.batteryLevel ? `${selectedDevice.batteryLevel}` : 'Unknown'}
                      </div>
                      {telemetry?.batteryStatus && (
                        <div className={`text-xs ${getBatteryStatusColor(telemetry.batteryStatus)} dark:text-opacity-90`}>
                          {telemetry.batteryStatus}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Wifi className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Connection</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedDevice.isOnline ? 'Connected' : 'Disconnected'}
                      </div>
                      {telemetry?.networkOperator && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{telemetry.networkOperator}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Last Seen</div>
                      {telemetry?.collectedAt && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Data: {formatDate(telemetry.collectedAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Thermometer className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Temperature</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {telemetry?.batteryTemperature ? telemetry.batteryTemperature : 'Unknown'}
                      </div>
                      {telemetry?.batteryVoltage && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{telemetry.batteryVoltage}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Device Name</label>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{selectedDevice.name}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Device ID</label>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{selectedDevice.deviceId}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Model</label>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{selectedDevice.model}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">OS Version</label>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{selectedDevice.osVersion}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">App Version</label>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{selectedDevice.appVersion}</div>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Current Location</label>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {telemetry?.address ? telemetry.address : formatLocation(selectedDevice.location) || 'Not available'}
                      </div>
                    </div>
                    {telemetry?.latitude && telemetry?.longitude && (
                      <>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Coordinates</label>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {telemetry.latitude.toFixed(6)}, {telemetry.longitude.toFixed(6)}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Accuracy</label>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {telemetry.accuracy ? `${telemetry.accuracy}m` : 'Unknown'}
                          </div>
                        </div>
                        {telemetry.altitude && (
                          <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">Altitude</label>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {telemetry.altitude}m
                            </div>
                          </div>
                        )}
                        {telemetry.speed && (
                          <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">Speed</label>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {telemetry.speed} m/s
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {telemetry?.collectedAt && (
                      <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400">Location Updated</label>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {formatDate(telemetry.collectedAt)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Device Performance */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Device Performance
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Device Status</label>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        <span className={`px-2 py-1 rounded-full text-xs ${selectedDevice.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}>
                          {selectedDevice.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Connection Status</label>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        <span className={`px-2 py-1 rounded-full text-xs ${selectedDevice.isOnline ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}>
                          {selectedDevice.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                    {telemetry && (
                      <>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Memory Usage</label>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {telemetry.usedMemoryPercentage ? `${telemetry.usedMemoryPercentage}%` : 'Unknown'}
                          </div>
                          {telemetry.freeMemory && telemetry.totalMemory && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {telemetry.freeMemory}GB free of {telemetry.totalMemory}GB
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Storage Usage</label>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {telemetry.freeStorage && telemetry.totalStorage ?
                              `${((telemetry.totalStorage - telemetry.freeStorage) / telemetry.totalStorage * 100).toFixed(1)}%` : 'Unknown'}
                          </div>
                          {telemetry.freeStorage && telemetry.totalStorage && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {telemetry.freeStorage}GB free of {telemetry.totalStorage}GB
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">Battery Health</label>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {telemetry.batteryCapacity || 'Unknown'}
                          </div>
                          {telemetry.batteryVoltage && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Voltage: {telemetry.batteryVoltage}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Last Activity</label>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedDevice.lastSeenAt ? formatDate(selectedDevice.lastSeenAt) : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Telemetry Information */}
          {telemetry && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <FaMicrochip className="h-5 w-5" />
                  System Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Brand</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{telemetry.brand || 'Unknown'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Manufacturer</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{telemetry.manufacturer || 'Unknown'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Model</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{telemetry.model || 'Unknown'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Android Version</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{telemetry.androidVersion || 'Unknown'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">SDK Version</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{telemetry.sdkVersion || 'Unknown'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Security Patch</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{telemetry.securityPatch || 'Unknown'}</div>
                  </div>
                </div>
              </div>

              {/* Memory & Storage */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <FaHdd className="h-5 w-5" />
                  Memory & Storage
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Total Memory</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {telemetry.totalMemory ? `${telemetry.totalMemory} GB` : 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Free Memory</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {telemetry.freeMemory ? `${telemetry.freeMemory} GB` : 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Memory Usage</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {telemetry.usedMemoryPercentage ? `${telemetry.usedMemoryPercentage}%` : 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Total Storage</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {telemetry.totalStorage ? `${telemetry.totalStorage} GB` : 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Free Storage</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {telemetry.freeStorage ? `${telemetry.freeStorage} GB` : 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Screen Resolution</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{telemetry.screenResolution || 'Unknown'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Network & Security */}
          {telemetry && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Network Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <FaSignal className="h-5 w-5" />
                  Network Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Network Operator</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{telemetry.networkOperator || 'Unknown'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">SIM Operator</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{telemetry.simOperator || 'Unknown'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">SIM Country</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{telemetry.simCountryISO || 'Unknown'}</div>
                  </div>
                </div>
              </div>

              {/* Security Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <FaShieldAlt className="h-5 w-5" />
                  Security Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Root Status</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      <span className={`px-2 py-1 rounded-full text-xs ${telemetry.isRooted ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        }`}>
                        {telemetry.isRooted ? 'Rooted' : 'Not Rooted'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Emulator Status</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      <span className={`px-2 py-1 rounded-full text-xs ${telemetry.isEmulator ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        }`}>
                        {telemetry.isEmulator ? 'Emulator' : 'Real Device'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">App Version</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{telemetry.appVersion || 'Unknown'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">App Version Code</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{telemetry.appVersionCode || 'Unknown'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </Layout>
    </AuthWrapper>
  );
}