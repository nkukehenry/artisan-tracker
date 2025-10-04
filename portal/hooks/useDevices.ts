'use client';

import { useState, useEffect, useMemo } from 'react';
import { Device, DeviceFilters, DeviceFormData, CreateDeviceData, UpdateDeviceData } from '@/types/device';
import { deviceApi } from '@/lib/deviceApi';
import { useAppDispatch } from '@/lib/hooks';
import { setLoading, addToast } from '@/store/slices/appSlice';

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filters, setFilters] = useState<DeviceFilters>({
    search: '',
    status: 'all',
    type: 'all',
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  // Load devices from API
  const loadDevices = async () => {
    setIsLoading(true);
    dispatch(setLoading({ isLoading: true, message: 'Loading devices...' }));
    
    try {
      const result = await deviceApi.getDevices({
        search: filters.search || undefined,
        status: filters.status === 'all' ? undefined : filters.status,
        type: filters.type === 'all' ? undefined : filters.type,
      });

      if (result.success) {
        setDevices(result.data.data || []);
      } else {
        dispatch(addToast({
          type: 'error',
          title: 'Failed to load devices',
          message: result.error?.message || 'An error occurred while loading devices',
        }));
      }
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Failed to load devices',
        message: 'An unexpected error occurred',
      }));
    } finally {
      setIsLoading(false);
      dispatch(setLoading({ isLoading: false }));
    }
  };

  // Load devices on mount and when filters change
  useEffect(() => {
    loadDevices();
  }, [filters.search, filters.status, filters.type]);

  // Filter devices based on current filters (client-side filtering for immediate response)
  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const matchesSearch = !filters.search || 
        device.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        device.deviceId.toLowerCase().includes(filters.search.toLowerCase()) ||
        (device.owner && device.owner.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesStatus = filters.status === 'all' || (() => {
        if (filters.status === 'online') return device.isOnline && device.isActive;
        if (filters.status === 'offline') return !device.isOnline && device.isActive;
        if (filters.status === 'in transit') return device.isActive && !device.isOnline;
        if (filters.status === 'maintenance') return !device.isActive;
        return true;
      })();
      
      const matchesType = filters.type === 'all' || 
        (device.type && device.type.toLowerCase() === filters.type.toLowerCase());
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [devices, filters]);

  const addDevice = async (deviceData: DeviceFormData) => {
    dispatch(setLoading({ isLoading: true, message: 'Adding device...' }));
    
    try {
      const createData: CreateDeviceData = {
        deviceId: deviceData.deviceId,
        name: deviceData.name,
        model: deviceData.model,
        osVersion: deviceData.osVersion,
        appVersion: deviceData.appVersion,
      };

      const result = await deviceApi.createDevice(createData);

      if (result.success) {
        // Refresh the devices list to ensure we have the latest data
        await loadDevices();
        dispatch(addToast({
          type: 'success',
          title: 'Device Added',
          message: `Device "${deviceData.name}" has been added successfully`,
        }));
      } else {
        dispatch(addToast({
          type: 'error',
          title: 'Failed to add device',
          message: result.error?.message || 'An error occurred while adding the device',
        }));
      }
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Failed to add device',
        message: 'An unexpected error occurred',
      }));
    } finally {
      dispatch(setLoading({ isLoading: false }));
    }
  };

  const updateDevice = async (deviceId: string, deviceData: Partial<UpdateDeviceData>) => {
    dispatch(setLoading({ isLoading: true, message: 'Updating device...' }));
    
    try {
      const updateData: UpdateDeviceData = {
        name: deviceData.name,
        type: deviceData.type,
        owner: deviceData.owner,
        location: deviceData.location,
        description: deviceData.description,
      };

      const result = await deviceApi.updateDevice(deviceId, updateData);

      if (result.success) {
        // Refresh the devices list to ensure we have the latest data
        await loadDevices();
        dispatch(addToast({
          type: 'success',
          title: 'Device Updated',
          message: `Device has been updated successfully`,
        }));
      } else {
        dispatch(addToast({
          type: 'error',
          title: 'Failed to update device',
          message: result.error?.message || 'An error occurred while updating the device',
        }));
      }
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Failed to update device',
        message: 'An unexpected error occurred',
      }));
    } finally {
      dispatch(setLoading({ isLoading: false }));
    }
  };

  const deleteDevice = async (deviceId: string) => {
    dispatch(setLoading({ isLoading: true, message: 'Deleting device...' }));
    
    try {
      const result = await deviceApi.deleteDevice(deviceId);

      if (result.success) {
        // Refresh the devices list to ensure we have the latest data
        await loadDevices();
        dispatch(addToast({
          type: 'success',
          title: 'Device Deleted',
          message: 'Device has been deleted successfully',
        }));
      } else {
        dispatch(addToast({
          type: 'error',
          title: 'Failed to delete device',
          message: result.error?.message || 'An error occurred while deleting the device',
        }));
      }
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Failed to delete device',
        message: 'An unexpected error occurred',
      }));
    } finally {
      dispatch(setLoading({ isLoading: false }));
    }
  };

  const updateFilters = (newFilters: Partial<DeviceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const refreshDevices = () => {
    loadDevices();
  };

  return {
    devices: filteredDevices,
    allDevices: devices,
    filters,
    isLoading,
    addDevice,
    updateDevice,
    deleteDevice,
    updateFilters,
    refreshDevices,
  };
}