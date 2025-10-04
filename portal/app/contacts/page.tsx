'use client';

import { useState } from 'react';
import Image from 'next/image';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { useContacts } from '@/hooks/useContacts';
import { useDevices } from '@/hooks/useDevices';
import DataTable from '@/components/ui/DataTable';
import SearchFilter from '@/components/ui/SearchFilter';
import Select from '@/components/ui/Select';
import { Contact } from '@/types/contact';

export default function ContactsPage() {
  const { devices } = useDevices();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  const {
    contacts,
    isLoading,
    error,
    filters,
    updateFilters,
  } = useContacts(selectedDeviceId);

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
  };

  const handleSearchChange = (search: string) => {
    updateFilters({ search });
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (item: Contact, value: unknown) => (
        <div className="flex items-center gap-3">
          {item.avatar ? (
            <Image
              src={item.avatar}
              alt={value as string}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {(value as string).charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="font-medium">{value as string}</span>
        </div>
      ),
    },
    {
      key: 'phoneNumber',
      label: 'Phone Number',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (item: Contact, value: unknown) => (value as string) || '-',
    },
    {
      key: 'createdAt',
      label: 'Added',
      sortable: true,
      render: (item: Contact, value: unknown) => new Date(value as string).toLocaleDateString(),
    },
  ];

  const deviceOptions = [
    { value: '', label: 'Select a device' },
    ...devices.map(device => ({
      value: device.deviceId,
      label: device.name,
    })),
  ];

  return (
    <AuthWrapper>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
              <p className="text-gray-600">View contacts from your devices</p>
            </div>
          </div>

          {/* Device Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Device:</label>
              <Select
                options={deviceOptions}
                value={selectedDeviceId}
                onChange={handleDeviceChange}
                placeholder="Select a device"
                className="min-w-[200px]"
              />
            </div>
          </div>

          {/* Search */}
          {selectedDeviceId && (
            <SearchFilter
              searchValue={filters.search || ''}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search contacts by name or phone..."
              filterValue=""
              onFilterChange={() => {}}
              filterOptions={[]}
              filterLabel=""
            />
          )}

          {/* Loading State */}
          {isLoading && contacts.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading contacts...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : !selectedDeviceId ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <p className="text-gray-600">Please select a device to view contacts</p>
              </div>
            </div>
          ) : (
            /* Contacts Table */
            <DataTable
              data={contacts}
              columns={columns}
              emptyMessage="No contacts found"
            />
          )}
        </div>
      </Layout>
    </AuthWrapper>
  );
}
