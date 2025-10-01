'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { Device } from '@/types/device';
import { deviceApi } from '@/lib/deviceApi';
import { useAppDispatch } from '@/lib/hooks';
import { addToast } from '@/store/slices/appSlice';
import { 
  ArrowLeft, 
  Smartphone, 
  Wifi, 
  Battery, 
  Clock,
  Monitor
} from 'lucide-react';

export default function DeviceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const deviceId = params.id as string;

  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  // Load device details
  const loadDevice = async () => {
    try {
      const result = await deviceApi.getDevice(deviceId);
      if (result.success) {
        setDevice(result.data);
      } else {
        dispatch(addToast({
          type: 'error',
          title: 'Failed to load device',
          message: result.error?.message || 'Device not found',
        }));
        router.push('/devices');
      }
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Failed to load device',
        message: 'An unexpected error occurred',
      }));
      router.push('/devices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (deviceId) {
      loadDevice();
    }
  }, [deviceId]);

  if (isLoading) {
    return (
      <AuthWrapper>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </Layout>
      </AuthWrapper>
    );
  }

  if (!device) {
    return (
      <AuthWrapper>
        <Layout>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Device Not Found</h2>
            <p className="text-gray-600 mb-4">The requested device could not be found.</p>
            <button
              onClick={() => router.push('/devices')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Devices
            </button>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/devices')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{device.name}</h1>
                <p className="text-gray-600">Device ID: {device.deviceId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${device?.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {device?.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Device Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <Smartphone className="w-6 h-6 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Model</p>
                  <p className="text-lg font-semibold text-gray-900">{device.model}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <Wifi className="w-6 h-6 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {device.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <Battery className="w-6 h-6 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Battery</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {device.batteryLevel || 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Last Seen</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Extended Device Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Details */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Device Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Device ID</span>
                  <span className="text-sm text-gray-900 font-mono">{device.deviceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">OS Version</span>
                  <span className="text-sm text-gray-900">{device.osVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">App Version</span>
                  <span className="text-sm text-gray-900">{device.appVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Device Type</span>
                  <span className="text-sm text-gray-900 capitalize">{device.type || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Owner</span>
                  <span className="text-sm text-gray-900">{device.owner || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Active Status</span>
                  <span className={`text-sm font-medium ${device.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {device.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Created</span>
                  <span className="text-sm text-gray-900">
                    {new Date(device.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-900">
                    {new Date(device.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Location Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Current Location</span>
                  <span className="text-sm text-gray-900">{device.location || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Last Location Update</span>
                  <span className="text-sm text-gray-900">
                    {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Connection Status</span>
                  <span className={`text-sm font-medium ${device.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {device.isOnline ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Battery Level</span>
                  <span className="text-sm text-gray-900">{device.batteryLevel || 0}%</span>
                </div>
                {device.description && (
                  <div className="pt-4 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-600 block mb-2">Description</span>
                    <p className="text-sm text-gray-900">{device.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-600">Manage this device</p>
            </div>
            <div className="p-6">
              <div className="flex gap-4">
                <button
                  onClick={() => router.push(`/remote-control?device=${device.id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Monitor className="h-4 w-4" />
                  Remote Control
                </button>
                <button
                  onClick={() => router.push('/devices')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Devices
                </button>
              </div>
            </div>
          </div>

        </div>
      </Layout>
    </AuthWrapper>
  );
}
