'use client';

import { Device } from '@/types/device';
import { getMinutesDifference, formatDateTime } from '@/lib/utils';

interface SelectedDeviceInfoProps {
    device: Device;
    className?: string;
}

export default function SelectedDeviceInfo({ device, className = '' }: SelectedDeviceInfoProps) {
    const getStatusColor = () => {
        if (!device.isActive) return 'bg-gray-500';
        const minutesDiff = getMinutesDifference(device.lastSeenAt);
        if (minutesDiff > 30) return 'bg-red-500';
        return 'bg-green-500';
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
            <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
                <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 uppercase">{device.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Battery: {device.batteryLevel}% • Last seen: {device.lastSeenAt ? formatDateTime(device.lastSeenAt) : 'Never'}</div>
                </div>
            </div>
        </div>
    );
}

