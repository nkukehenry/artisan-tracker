'use client';

import { useState } from 'react';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { useMessages } from '@/hooks/useMessages';
import { useDeviceContext } from '@/contexts/DeviceContext';
import DataTable from '@/components/ui/DataTable';
import SearchFilter from '@/components/ui/SearchFilter';
import LocationBadge from '@/components/ui/LocationBadge';
import MessageDetailModal from '@/components/messages/MessageDetailModal';
import { Message } from '@/types/message';
import { Smartphone, Eye, ArrowDown, ArrowUp } from 'lucide-react';
import {
  FaSms,
  FaWhatsapp,
  FaTelegram,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaGoogle,
  FaTiktok
} from 'react-icons/fa';
import { truncateWithTooltip } from '@/lib/textUtils';
import { getMessageTypeOptions } from '@/lib/messageTypes';

export default function MessagesPage() {
  const { selectedDevice } = useDeviceContext();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  const {
    messages,
    isLoading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    changeLimit,
  } = useMessages();

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setIsFiltering(true);
    updateFilters(newFilters);
    // Simulate filtering delay
    setTimeout(() => setIsFiltering(false), 500);
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  const getMessageTypeIcon = (messageType: string) => {
    switch (messageType) {
      case 'SMS':
        return <FaSms className="h-4 w-4" />;
      case 'WHATSAPP':
        return <FaWhatsapp className="h-4 w-4" />;
      case 'TELEGRAM':
        return <FaTelegram className="h-4 w-4" />;
      case 'FACEBOOK':
        return <FaFacebook className="h-4 w-4" />;
      case 'INSTAGRAM':
        return <FaInstagram className="h-4 w-4" />;
      case 'TWITTER':
        return <FaTwitter className="h-4 w-4" />;
      case 'GMAIL':
        return <FaGoogle className="h-4 w-4" />;
      case 'TIKTOK':
        return <FaTiktok className="h-4 w-4" />;
      default:
        return <FaSms className="h-4 w-4" />;
    }
  };

  const columns = [
    {
      key: 'messageType',
      label: 'Type',
      sortable: true,
      render: (item: Message, value: unknown) => (
        <span className={`inline-flex items-center gap-2 px-3 py-3 rounded-full text-xs font-medium ${(value as string) === 'SMS' ? 'bg-purple-100 text-purple-800' :
          (value as string) === 'WHATSAPP' ? 'bg-green-100 text-green-800' :
            (value as string) === 'TELEGRAM' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
          }`}>
          {getMessageTypeIcon(value as string)}
        </span>
      ),
    },
    {
      key: 'isIncoming',
      label: 'Direction',
      sortable: true,
      render: (item: Message, value: unknown) => (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${value ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
          {value ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
          {value ? 'Incoming' : 'Outgoing'}
        </span>
      ),
    },
    {
      key: 'sender',
      label: 'From',
      sortable: true,
      render: (item: Message, value: unknown) => {
        const truncated = truncateWithTooltip(value as string, 15);
        return (
          <span
            className="cursor-help"
            title={truncated.isTruncated ? truncated.fullText : undefined}
          >
            {truncated.display}
          </span>
        );
      },
    },
    {
      key: 'recipient',
      label: 'To',
      sortable: true,
      render: (item: Message, value: unknown) => {
        const truncated = truncateWithTooltip(value as string, 10);
        return (
          <span
            className="cursor-help"
            title={truncated.isTruncated ? truncated.fullText : undefined}
          >
            {truncated.display}
          </span>
        );
      },
    },
    {
      key: 'content',
      label: 'Message',
      sortable: false,
      render: (item: Message, value: unknown) => {
        const truncated = truncateWithTooltip(value as string, 30);
        return (
          <div className="space-y-1">
            <div
              className="cursor-help"
              title={truncated.isTruncated ? truncated.fullText : undefined}
            >
              {truncated.display}
            </div>
            {(item.location || item.gpsCoordinates) && (
              <LocationBadge location={item.location} gpsCoordinates={item.gpsCoordinates} />
            )}
          </div>
        );
      },
    },
    {
      key: 'timestamp',
      label: 'Date & Time',
      sortable: true,
      render: (item: Message, value: unknown) => new Date(value as string).toLocaleString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (item: Message) => (
        <button
          onClick={() => handleViewMessage(item)}
          className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
        >
          <Eye className="h-4 w-4" />
          View Details
        </button>
      ),
    },
  ];

  const messageTypeOptions = [
    { value: '', label: 'All Message Types' },
    ...getMessageTypeOptions()
  ];

  const directionOptions = [
    { value: '', label: 'All Message Directions' },
    { value: 'true', label: 'Incoming' },
    { value: 'false', label: 'Outgoing' },
  ];

  if (!selectedDevice) {
    return (
      <AuthWrapper>
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <Smartphone className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Device Selected</h2>
            <p className="text-gray-600 mb-6">
              Please select a device from the dropdown in the header to view messages.
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
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">View message history for {selectedDevice.name}</p>
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

          {/* Filters */}
          <div className="flex gap-4">
            <SearchFilter
              searchValue=""
              onSearchChange={() => { }}
              searchPlaceholder="Search messages..."
              filterValue={filters.messageType || ''}
              onFilterChange={(value) => handleFilterChange({ messageType: value as 'SMS' | 'WHATSAPP' | 'TELEGRAM' })}
              filterOptions={messageTypeOptions}
              filterLabel="Message Type"
            />

            <select
              value={filters.isIncoming !== undefined ? filters.isIncoming.toString() : ''}
              onChange={(e) => handleFilterChange({ isIncoming: e.target.value === '' ? undefined : e.target.value === 'true' })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {/* <option value="">All {filterLabel}</option> */}
              {directionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Loading State */}
          {isLoading && messages.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading messages...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : (
            /* Messages Table */
            <div className="relative">
              {isFiltering && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Filtering messages...</p>
                  </div>
                </div>
              )}
              <DataTable
                data={messages}
                columns={columns}
                emptyMessage="No messages found"
                pagination={pagination || undefined}
                onPageChange={changePage}
                onLimitChange={changeLimit}
              />
            </div>
          )}
        </div>

        {/* Message Detail Modal */}
        <MessageDetailModal
          message={selectedMessage}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </Layout>
    </AuthWrapper>
  );
}
