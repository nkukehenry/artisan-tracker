'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Device } from '@/types/device';
import { deviceApi } from '@/lib/deviceApi';
import { useAppDispatch } from '@/lib/hooks';
import { addToast } from '@/store/slices/appSlice';

interface DeviceContextType {
    selectedDevice: Device | null;
    devices: Device[];
    isLoading: boolean;
    selectDevice: (device: Device | null) => void;
    refreshDevices: () => Promise<void>;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

interface DeviceProviderProps {
    children: ReactNode;
}

export function DeviceProvider({ children }: DeviceProviderProps) {
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [devices, setDevices] = useState<Device[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();

    // Load devices from API
    const loadDevices = async () => {
        setIsLoading(true);
        try {
            const result = await deviceApi.getDevices();
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
        }
    };

    // Load devices on mount
    useEffect(() => {
        loadDevices();
    }, []);

    // Load selected device from localStorage on mount
    useEffect(() => {
        const savedDeviceId = localStorage.getItem('selectedDeviceId');
        if (savedDeviceId && devices.length > 0) {
            const device = devices.find(d => d.deviceId === savedDeviceId);
            if (device) {
                setSelectedDevice(device);
            }
        }
    }, [devices]);

    // Save selected device to localStorage
    useEffect(() => {
        if (selectedDevice) {
            localStorage.setItem('selectedDeviceId', selectedDevice.deviceId);
        } else {
            localStorage.removeItem('selectedDeviceId');
        }
    }, [selectedDevice]);

    const selectDevice = (device: Device | null) => {
        setSelectedDevice(device);
    };

    const refreshDevices = async () => {
        await loadDevices();
    };

    const value: DeviceContextType = {
        selectedDevice,
        devices,
        isLoading,
        selectDevice,
        refreshDevices,
    };

    return (
        <DeviceContext.Provider value={value}>
            {children}
        </DeviceContext.Provider>
    );
}

export function useDeviceContext() {
    const context = useContext(DeviceContext);
    if (context === undefined) {
        throw new Error('useDeviceContext must be used within a DeviceProvider');
    }
    return context;
}
