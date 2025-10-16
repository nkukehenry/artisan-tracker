'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
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
    const hasInitialized = useRef(false);

    // Load devices from API
    const loadDevices = async () => {
        setIsLoading(true);
        try {
            const result = await deviceApi.getDevices();
            console.log('DeviceContext - API result:', result);
            console.log('DeviceContext - result.data:', result.data);
            console.log('DeviceContext - result.data type:', typeof result.data);
            console.log('DeviceContext - result.data isArray:', Array.isArray(result.data));

            if (result.success) {
                // Handle different possible response structures
                let devicesData = result.data;

                // If result.data is an object with a data property, extract it
                if (devicesData && typeof devicesData === 'object' && 'data' in devicesData) {
                    devicesData = (devicesData as any).data;
                }

                // Ensure we have an array
                const finalDevices = Array.isArray(devicesData) ? devicesData : [];
                console.log('DeviceContext - final devices:', finalDevices);

                setDevices(finalDevices);
            } else {
                dispatch(addToast({
                    type: 'error',
                    title: 'Failed to load devices',
                    message: result.error?.message || 'An error occurred while loading devices',
                }));
            }
        } catch (error) {
            console.error('DeviceContext - Error loading devices:', error);
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

    // Load selected device from localStorage on mount and auto-select first device if none selected
    useEffect(() => {
        // Only run this logic once when devices are first loaded
        if (!hasInitialized.current && devices.length > 0) {
            hasInitialized.current = true;

            const savedDeviceId = localStorage.getItem('selectedDeviceId');

            if (savedDeviceId) {
                // Try to restore previously selected device
                const device = devices.find(d => d.deviceId === savedDeviceId);
                if (device) {
                    setSelectedDevice(device);
                    return;
                }
            }

            // If no saved device found or saved device doesn't exist, select first device
            setSelectedDevice(devices[0]);
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
        hasInitialized.current = false; // Reset initialization flag
        await loadDevices();
        // After refreshing devices, the useEffect will handle auto-selection
    };

    const value: DeviceContextType = {
        selectedDevice,
        devices: devices || [],
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
