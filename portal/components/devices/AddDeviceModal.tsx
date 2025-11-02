'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { DeviceFormData } from '@/types/device';

export interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (device: DeviceFormData) => void;
}


export default function AddDeviceModal({ isOpen, onClose, onAdd }: AddDeviceModalProps) {
  const [formData, setFormData] = useState<DeviceFormData>({
    deviceId: '',
    name: '',
    model: '',
    osVersion: '',
    appVersion: '',
  });
  const [errors, setErrors] = useState<Partial<DeviceFormData>>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Partial<DeviceFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Device name is required';
    }

    if (!formData.deviceId.trim()) {
      newErrors.deviceId = 'Device ID is required';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    if (!formData.osVersion.trim()) {
      newErrors.osVersion = 'OS Version is required';
    }

    if (!formData.appVersion.trim()) {
      newErrors.appVersion = 'App Version is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onAdd(formData);
      setFormData({
        name: '',
        deviceId: '',
        model: '',
        osVersion: '',
        appVersion: '',
      });
      setErrors({});
    }
  };

  const handleInputChange = (field: keyof DeviceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-blue-900/20 dark:bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add New Device</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Device Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent ${errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="e.g., iPhone 14 Pro"
              />
              {errors.name && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Device ID *
              </label>
              <input
                type="text"
                id="deviceId"
                value={formData.deviceId}
                onChange={(e) => handleInputChange('deviceId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent ${errors.deviceId ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="e.g., DEV001"
              />
              {errors.deviceId && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.deviceId}</p>}
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Model *
              </label>
              <input
                type="text"
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent ${errors.model ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="e.g., iPhone 13 Pro"
              />
              {errors.model && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.model}</p>}
            </div>

            <div>
              <label htmlFor="osVersion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                OS Version *
              </label>
              <input
                type="text"
                id="osVersion"
                value={formData.osVersion}
                onChange={(e) => handleInputChange('osVersion', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent ${errors.osVersion ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="e.g., iOS 15.0"
              />
              {errors.osVersion && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.osVersion}</p>}
            </div>

            <div className="col-span-2">
              <label htmlFor="appVersion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                App Version *
              </label>
              <input
                type="text"
                id="appVersion"
                value={formData.appVersion}
                onChange={(e) => handleInputChange('appVersion', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent ${errors.appVersion ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="e.g., 1.0.0"
              />
              {errors.appVersion && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.appVersion}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Add Device
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
