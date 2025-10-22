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
  User,
  Settings,
  Edit,
  RefreshCw,
  AlertCircle,
  Cpu,
  HardDrive,
  Thermometer,
  Signal,
  Shield,
  Activity
} from 'lucide-react';

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
            <Smartphone className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Device Selected</h2>
            <p className="text-gray-600 mb-6">
              Please select a device from the dropdown in the header to view its information.
            </p>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getBatteryStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'charging': return 'text-green-600';
      case 'discharging': return 'text-red-600';
      case 'full': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getBatteryStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'charging': return '🔋';
      case 'discharging': return '🔋';
      case 'full': return '🔋';
      default: return '🔋';
    }
  };

  return (
    <AuthWrapper>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Device Information</h1>
              <p className="text-gray-600">Detailed information about the selected device</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Edit className="h-4 w-4" />
                Edit Device
              </button>
            </div>
          </div>

          {/* Device Status Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Device Status</h2>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedDevice)}`}></div>
                <span className="text-sm font-medium text-gray-900">{getStatusText(selectedDevice)}</span>
                {telemetryLoading && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
              </div>
            </div>

            {telemetryError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700">{telemetryError}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <Battery className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Battery Level</div>
                  <div className="font-medium text-gray-900">
                    {telemetry?.batteryPercentage || selectedDevice.batteryLevel ?
                      `${telemetry?.batteryPercentage || selectedDevice.batteryLevel}` : 'Unknown'}
                  </div>
                  {telemetry?.batteryStatus && (
                    <div className={`text-xs ${getBatteryStatusColor(telemetry.batteryStatus)}`}>
                      {telemetry.batteryStatus}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Connection</div>
                  <div className="font-medium text-gray-900">
                    {selectedDevice.isOnline ? 'Connected' : 'Disconnected'}
                  </div>
                  {telemetry?.networkOperator && (
                    <div className="text-xs text-gray-500">{telemetry.networkOperator}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Last Seen</div>
                  {telemetry?.collectedAt && (
                    <div className="text-xs text-gray-500">
                      Data: {formatDate(telemetry.collectedAt)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Thermometer className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Temperature</div>
                  <div className="font-medium text-gray-900">
                    {telemetry?.batteryTemperature || 'Unknown'}
                  </div>
                  {telemetry?.batteryVoltage && (
                    <div className="text-xs text-gray-500">{telemetry.batteryVoltage}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Device Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Device Name</label>
                  <div className="font-medium text-gray-900">{selectedDevice.name}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Device ID</label>
                  <div className="font-medium text-gray-900">{selectedDevice.deviceId}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Model</label>
                  <div className="font-medium text-gray-900">{selectedDevice.model}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">OS Version</label>
                  <div className="font-medium text-gray-900">{selectedDevice.osVersion}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">App Version</label>
                  <div className="font-medium text-gray-900">{selectedDevice.appVersion}</div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Current Location</label>
                  <div className="font-medium text-gray-900">
                    {telemetry?.address || selectedDevice.location || 'Not available'}
                  </div>
                </div>
                {telemetry?.latitude && telemetry?.longitude && (
                  <>
                    <div>
                      <label className="text-sm text-gray-500">Coordinates</label>
                      <div className="font-medium text-gray-900">
                        {telemetry.latitude.toFixed(6)}, {telemetry.longitude.toFixed(6)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Accuracy</label>
                      <div className="font-medium text-gray-900">
                        {telemetry.accuracy ? `${telemetry.accuracy}m` : 'Unknown'}
                      </div>
                    </div>
                    {telemetry.altitude && (
                      <div>
                        <label className="text-sm text-gray-500">Altitude</label>
                        <div className="font-medium text-gray-900">
                          {telemetry.altitude}m
                        </div>
                      </div>
                    )}
                    {telemetry.speed && (
                      <div>
                        <label className="text-sm text-gray-500">Speed</label>
                        <div className="font-medium text-gray-900">
                          {telemetry.speed} m/s
                        </div>
                      </div>
                    )}
                  </>
                )}
                {telemetry?.collectedAt && (
                  <div>
                    <label className="text-sm text-gray-500">Location Updated</label>
                    <div className="font-medium text-gray-900">
                      {formatDate(telemetry.collectedAt)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Device Performance */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Device Performance
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Device Status</label>
                  <div className="font-medium text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs ${selectedDevice.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {selectedDevice.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Connection Status</label>
                  <div className="font-medium text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs ${selectedDevice.isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {selectedDevice.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                {telemetry && (
                  <>
                    <div>
                      <label className="text-sm text-gray-500">Memory Usage</label>
                      <div className="font-medium text-gray-900">
                        {telemetry.usedMemoryPercentage ? `${telemetry.usedMemoryPercentage}%` : 'Unknown'}
                      </div>
                      {telemetry.freeMemory && telemetry.totalMemory && (
                        <div className="text-xs text-gray-500">
                          {telemetry.freeMemory}GB free of {telemetry.totalMemory}GB
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Storage Usage</label>
                      <div className="font-medium text-gray-900">
                        {telemetry.freeStorage && telemetry.totalStorage ?
                          `${((telemetry.totalStorage - telemetry.freeStorage) / telemetry.totalStorage * 100).toFixed(1)}%` : 'Unknown'}
                      </div>
                      {telemetry.freeStorage && telemetry.totalStorage && (
                        <div className="text-xs text-gray-500">
                          {telemetry.freeStorage}GB free of {telemetry.totalStorage}GB
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Battery Health</label>
                      <div className="font-medium text-gray-900">
                        {telemetry.batteryCapacity || 'Unknown'}
                      </div>
                      {telemetry.batteryVoltage && (
                        <div className="text-xs text-gray-500">
                          Voltage: {telemetry.batteryVoltage}
                        </div>
                      )}
                    </div>
                  </>
                )}
                <div>
                  <label className="text-sm text-gray-500">Last Activity</label>
                  <div className="font-medium text-gray-900">
                    {selectedDevice.lastSeenAt ? formatDate(selectedDevice.lastSeenAt) : 'Never'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Information */}
          {telemetry && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  System Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Brand</label>
                    <div className="font-medium text-gray-900">{telemetry.brand || 'Unknown'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Manufacturer</label>
                    <div className="font-medium text-gray-900">{telemetry.manufacturer || 'Unknown'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Model</label>
                    <div className="font-medium text-gray-900">{telemetry.model || 'Unknown'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Android Version</label>
                    <div className="font-medium text-gray-900">{telemetry.androidVersion || 'Unknown'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">SDK Version</label>
                    <div className="font-medium text-gray-900">{telemetry.sdkVersion || 'Unknown'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Security Patch</label>
                    <div className="font-medium text-gray-900">{telemetry.securityPatch || 'Unknown'}</div>
                  </div>
                </div>
              </div>

              {/* Memory & Storage */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Memory & Storage
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Total Memory</label>
                    <div className="font-medium text-gray-900">
                      {telemetry.totalMemory ? `${telemetry.totalMemory} GB` : 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Free Memory</label>
                    <div className="font-medium text-gray-900">
                      {telemetry.freeMemory ? `${telemetry.freeMemory} GB` : 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Memory Usage</label>
                    <div className="font-medium text-gray-900">
                      {telemetry.usedMemoryPercentage ? `${telemetry.usedMemoryPercentage}%` : 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Total Storage</label>
                    <div className="font-medium text-gray-900">
                      {telemetry.totalStorage ? `${telemetry.totalStorage} GB` : 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Free Storage</label>
                    <div className="font-medium text-gray-900">
                      {telemetry.freeStorage ? `${telemetry.freeStorage} GB` : 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Screen Resolution</label>
                    <div className="font-medium text-gray-900">{telemetry.screenResolution || 'Unknown'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Network & Security */}
          {telemetry && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Network Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Signal className="h-5 w-5" />
                  Network Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Network Operator</label>
                    <div className="font-medium text-gray-900">{telemetry.networkOperator || 'Unknown'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">SIM Operator</label>
                    <div className="font-medium text-gray-900">{telemetry.simOperator || 'Unknown'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">SIM Country</label>
                    <div className="font-medium text-gray-900">{telemetry.simCountryISO || 'Unknown'}</div>
                  </div>
                </div>
              </div>

              {/* Security Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Root Status</label>
                    <div className="font-medium text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs ${telemetry.isRooted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                        {telemetry.isRooted ? 'Rooted' : 'Not Rooted'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Emulator Status</label>
                    <div className="font-medium text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs ${telemetry.isEmulator ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                        {telemetry.isEmulator ? 'Emulator' : 'Real Device'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">App Version</label>
                    <div className="font-medium text-gray-900">{telemetry.appVersion || 'Unknown'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">App Version Code</label>
                    <div className="font-medium text-gray-900">{telemetry.appVersionCode || 'Unknown'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">View Location</div>
                  <div className="text-sm text-gray-500">Check current location</div>
                </div>
              </button>

              <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Remote Control</div>
                  <div className="text-sm text-gray-500">Control device remotely</div>
                </div>
              </button>

              <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Device Logs</div>
                  <div className="text-sm text-gray-500">View activity logs</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </AuthWrapper>
  );
}