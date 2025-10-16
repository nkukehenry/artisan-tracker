import { ChevronDown } from 'lucide-react';
import { Device } from '@/types/device';

interface DeviceSelectorProps {
  devices: Device[];
  selectedDevice: Device | null;
  onDeviceSelect: (device: Device | null) => void;
}

export default function DeviceSelector({
  devices,
  selectedDevice,
  onDeviceSelect,
}: DeviceSelectorProps) {
  const handleChange = (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId) || null;
    onDeviceSelect(device);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Device</h2>
      
      <div className="relative">
        <select
          value={selectedDevice?.id || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
        >
          <option value="">Choose a device...</option>
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name} ({device.deviceId}) - {device.isOnline ? 'Online' : 'Offline'}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>

      {selectedDevice && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{selectedDevice.name}</h3>
              <p className="text-sm text-gray-600">
                {selectedDevice.model} • {selectedDevice.isOnline ? 'Online' : 'Offline'} •
                Battery: {selectedDevice.batteryLevel || 0}%
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                selectedDevice.isOnline
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {selectedDevice.isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

