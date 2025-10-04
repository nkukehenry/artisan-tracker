'use client';

import { Column } from '@/components/ui/DataTable';
import { Device } from '@/types/device';
import StatusBadge from '@/components/ui/StatusBadge';
import ProgressBar from '@/components/ui/ProgressBar';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface DeviceTableColumnsProps {
  onView: (device: Device) => void;
  onEdit: (device: Device) => void;
  onDelete: (deviceId: string) => void;
}

interface DeviceActionsProps {
  device: Device;
  onEdit: (device: Device) => void;
  onDelete: (deviceId: string) => void;
}

function DeviceActions({ device, onEdit, onDelete }: DeviceActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${device.name}"? This action cannot be undone.`)) {
      onDelete(device.id);
    }
    setIsOpen(false);
  };

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right - 192 + window.scrollX, // 192px is the width of the dropdown (w-48)
      });
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-50" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div 
            className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-[60]"
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  window.location.href = `/devices/${device.id}`;
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
              
              <button
                onClick={() => {
                  onEdit(device);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Device
              </button>
              
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Device
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

export function createDeviceTableColumns({
  onEdit,
  onDelete,
}: DeviceTableColumnsProps): Column<Device>[] {
  return [
    {
      key: 'name',
      label: 'Device Name',
      render: (device) => (
        <div className="text-sm font-medium text-gray-900">{device.name}</div>
      ),
    },
    {
      key: 'deviceId',
      label: 'Device ID',
      render: (device) => (
        <div className="text-sm text-gray-600">{device.deviceId}</div>
      ),
    },
    {
      key: 'model',
      label: 'Model',
      render: (device) => (
        <div className="text-sm text-gray-600">{device.model}</div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (device) => {
        // Determine status based on API response fields
        let status = 'offline';
        if (device.isOnline && device.isActive) {
          status = 'online';
        } else if (device.isActive && !device.isOnline) {
          status = 'in transit';
        } else if (!device.isActive) {
          status = 'maintenance';
        }
        return <StatusBadge status={status} />;
      },
    },
    {
      key: 'location',
      label: 'Location',
      render: (device) => (
        <span className="text-sm text-gray-900">{device.location || 'Unknown'}</span>
      ),
    },
    {
      key: 'battery',
      label: 'Battery',
      render: (device) => (
        <ProgressBar
          value={device.batteryLevel || 0}
          size="sm"
          showLabel={true}
          className="max-w-24"
        />
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (device) => (
        <span className="text-sm text-gray-900">{device.owner || 'Unknown'}</span>
      ),
    },
    {
      key: 'lastSeen',
      label: 'Last Seen',
      render: (device) => (
        <span className="text-sm text-gray-500">
          {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (device) => (
        <div className="flex items-center justify-end">
          <DeviceActions
            device={device}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ),
    },
  ];
}
