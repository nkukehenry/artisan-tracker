'use client';

import { useState } from 'react';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { Plus } from 'lucide-react';
import { Device } from '@/types/device';
import { useDevices } from '@/hooks/useDevices';
import { createDeviceTableColumns } from '@/components/devices/DeviceTableColumns';
import DataTable from '@/components/ui/DataTable';
import SearchFilter from '@/components/ui/SearchFilter';
import AddDeviceModal from '@/components/devices/AddDeviceModal';

export default function DevicesPage() {
  const {
    devices,
    filters,
    isLoading,
    addDevice,
    deleteDevice,
    updateFilters,
  } = useDevices();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const handleAddDevice = (deviceData: any) => {
    addDevice(deviceData);
    setIsAddModalOpen(false);
  };

  const handleEditDevice = (device: Device) => {
    setSelectedDevice(device);
    // TODO: Open edit modal
  };

  const handleDeleteDevice = (deviceId: string) => {
    deleteDevice(deviceId);
  };

  const handleViewDevice = (device: Device) => {
    setSelectedDevice(device);
    // TODO: Open view modal
  };

  const columns = createDeviceTableColumns({
    onView: handleViewDevice,
    onEdit: handleEditDevice,
    onDelete: handleDeleteDevice,
  });

  const statusFilterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'online', label: 'Online' },
    { value: 'in transit', label: 'In Transit' },
    { value: 'offline', label: 'Offline' },
    { value: 'maintenance', label: 'Maintenance' },
  ];


  const emptyAction = (
    <button
      onClick={() => setIsAddModalOpen(true)}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
    >
      Add Device
    </button>
  );

  return (
    <AuthWrapper>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
              <p className="text-gray-600">Manage and monitor your tracking devices</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Device
            </button>
          </div>

          {/* Search and Filters */}
          <SearchFilter
            searchValue={filters.search}
            onSearchChange={(value) => updateFilters({ search: value })}
            searchPlaceholder="Search devices..."
            filterValue={filters.status}
            onFilterChange={(value) => updateFilters({ status: value })}
            filterOptions={statusFilterOptions}
            filterLabel="Status"
          />

          {/* Loading State */}
          {isLoading && devices.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading devices...</p>
              </div>
            </div>
          ) : (
            /* Devices Table */
            <DataTable
              data={devices}
              columns={columns}
              emptyMessage="No devices found"
              emptyAction={emptyAction}
            />
          )}
        </div>

        {/* Add Device Modal */}
        <AddDeviceModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddDevice}
        />
      </Layout>
    </AuthWrapper>
  );
}
