'use client';

import { useState } from 'react';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { useDeviceContext } from '@/contexts/DeviceContext';
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
  AlertCircle
} from 'lucide-react';

export default function DeviceInformationPage() {
  const { selectedDevice, refreshDevices } = useDeviceContext();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshDevices();
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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Battery className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Battery Level</div>
                  <div className="font-medium text-gray-900">
                    {selectedDevice.batteryLevel ? `${selectedDevice.batteryLevel}%` : 'Unknown'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Connection</div>
                  <div className="font-medium text-gray-900">
                    {selectedDevice.isOnline ? 'Connected' : 'Disconnected'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Last Seen</div>
                  <div className="font-medium text-gray-900">
                    {selectedDevice.lastSeenAt ? formatDate(selectedDevice.lastSeenAt) : 'Never'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Device Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            {/* Additional Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Device Type</label>
                  <div className="font-medium text-gray-900">
                    {selectedDevice.type ? selectedDevice.type.charAt(0).toUpperCase() + selectedDevice.type.slice(1) : 'Not specified'}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Owner</label>
                  <div className="font-medium text-gray-900">
                    {selectedDevice.owner || 'Not assigned'}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Location</label>
                  <div className="font-medium text-gray-900">
                    {selectedDevice.location || 'Not specified'}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Description</label>
                  <div className="font-medium text-gray-900">
                    {selectedDevice.description || 'No description provided'}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Created At</label>
                  <div className="font-medium text-gray-900">{formatDate(selectedDevice.createdAt)}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Last Updated</label>
                  <div className="font-medium text-gray-900">{formatDate(selectedDevice.updatedAt)}</div>
                </div>
              </div>
            </div>
          </div>

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