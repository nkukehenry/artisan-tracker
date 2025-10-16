'use client';

import React, { useState } from 'react';
import { ChevronDown, Smartphone, Check, Search, X } from 'lucide-react';
import { Device } from '@/types/device';
import { useDeviceContext } from '@/contexts/DeviceContext';

interface DeviceSelectorProps {
    className?: string;
}

export default function DeviceSelector({ className = '' }: DeviceSelectorProps) {
    const { selectedDevice, devices, isLoading, selectDevice } = useDeviceContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDevices = devices.filter(device =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (device.owner && device.owner.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDeviceSelect = (device: Device) => {
        selectDevice(device);
        setIsModalOpen(false);
        setSearchTerm('');
    };

    const handleClearSelection = () => {
        selectDevice(null);
    };

    const getStatusColor = (device: Device) => {
        if (!device.isActive) return 'bg-gray-500';
        if (device.isOnline) return 'bg-green-500';
        return 'bg-red-500';
    };

    const getStatusText = (device: Device) => {
        if (!device.isActive) return 'Inactive';
        if (device.isOnline) return 'Online';
        return 'Offline';
    };

    return (
        <>
            {/* Device Selector Button */}
            <div className={`relative ${className}`}>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-gray-500" />
                        <div className="text-left">
                            {selectedDevice ? (
                                <div>
                                    <div className="font-medium text-gray-900">{selectedDevice.name}</div>
                                    <div className="text-sm text-gray-500">{selectedDevice.deviceId}</div>
                                </div>
                            ) : (
                                <div className="text-gray-500">Select a device</div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedDevice && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClearSelection();
                                }}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleClearSelection();
                                    }
                                }}
                            >
                                <X className="h-4 w-4 text-gray-400" />
                            </div>
                        )}
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                </button>
            </div>

            {/* Device Selection Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 border border-gray-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Select Device</h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSearchTerm('');
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search devices..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Device List */}
                        <div className="max-h-96 overflow-y-auto">
                            {isLoading ? (
                                <div className="p-12 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading devices...</p>
                                </div>
                            ) : filteredDevices.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Smartphone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600">
                                        {searchTerm ? 'No devices found matching your search' : 'No devices available'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {filteredDevices.map((device) => (
                                        <button
                                            key={device.id}
                                            onClick={() => handleDeviceSelect(device)}
                                            className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0">
                                                        <div className={`w-3 h-3 rounded-full ${getStatusColor(device)}`}></div>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{device.name}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {device.deviceId} • {device.model}
                                                        </div>
                                                        {device.owner && (
                                                            <div className="text-xs text-gray-400">Owner: {device.owner}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {getStatusText(device)}
                                                        </div>
                                                        {device.lastSeenAt && (
                                                            <div className="text-xs text-gray-400">
                                                                Last seen: {new Date(device.lastSeenAt).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {selectedDevice?.id === device.id && (
                                                        <Check className="h-5 w-5 text-blue-600" />
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''} available
                                </div>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
