'use client';

import { useState } from 'react';
import Image from 'next/image';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { useContacts } from '@/hooks/useContacts';
import { useDeviceContext } from '@/contexts/DeviceContext';
import DataTable from '@/components/ui/DataTable';
import SearchFilter from '@/components/ui/SearchFilter';
import { Contact } from '@/types/contact';
import { Users } from 'lucide-react';

export default function ContactsPage() {
  const { selectedDevice } = useDeviceContext();

  const {
    contacts,
    isLoading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    changeLimit,
  } = useContacts();

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

  if (!selectedDevice) {
    return (
      <AuthWrapper>
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <Users className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Device Selected</h2>
            <p className="text-gray-600 mb-6">
              Please select a device from the dropdown in the header to view contacts.
            </p>
          </div>
        </Layout>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
              <p className="text-gray-600">View contacts from {selectedDevice.name}</p>
            </div>
          </div>

          {/* Selected Device Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${selectedDevice.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <div className="font-medium text-gray-900">{selectedDevice.name}</div>
                <div className="text-sm text-gray-500">{selectedDevice.deviceId} • {selectedDevice.model}</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <SearchFilter
            searchValue={filters.search || ''}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search contacts by name or phone..."
            filterValue=""
            onFilterChange={() => { }}
            filterOptions={[]}
            filterLabel=""
          />

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
          ) : (
            /* Contacts Table */
            <DataTable
              data={contacts}
              columns={columns}
              emptyMessage="No contacts found"
              pagination={pagination || undefined}
              onPageChange={changePage}
              onLimitChange={changeLimit}
            />
          )}
        </div>
      </Layout>
    </AuthWrapper>
  );
}
