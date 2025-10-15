'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { Device } from '@/types/device';
import { deviceApi } from '@/lib/deviceApi';
import { useAppDispatch } from '@/lib/hooks';
import { addToast } from '@/store/slices/appSlice';
import ScreenShareModal from '@/components/devices/ScreenShareModal';
import DeviceSelector from '@/components/remote-control/DeviceSelector';
import ScreenShareSection from '@/components/remote-control/ScreenShareSection';
import CommandButtons from '@/components/remote-control/CommandButtons';
import PreviousRecordings from '@/components/remote-control/PreviousRecordings';
import { useWebSocketConnection } from '@/hooks/useWebSocketConnection';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useRemoteCommands } from '@/hooks/useRemoteCommands';

interface Recording {
  id: string;
  deviceId: string;
  deviceName: string;
  type: string;
  timestamp: string;
  duration: string;
  size: string;
}

export default function RemoteControlPage() {
  const dispatch = useAppDispatch();
  const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:9090/signaling';

  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScreenShareModalOpen, setIsScreenShareModalOpen] = useState(false);
  const [screenShareStatus, setScreenShareStatus] = useState('disconnected');
  const [previousRecordings, setPreviousRecordings] = useState<Recording[]>([]);

  // WebSocket connection
  const {
    wsConnection,
    isConnected,
    connect: connectWebSocket,
    disconnect: disconnectWebSocket,
    reconnect: reconnectWebSocket,
  } = useWebSocketConnection({
    url: wsUrl,
    onMessage: handleWebSocketMessage,
    onOpen: () => {
      setScreenShareStatus('connected - waiting for offer');
    },
    onClose: () => {
      setScreenShareStatus('disconnected');
    },
    onError: () => {
      setScreenShareStatus('error');
    },
  });

  // WebRTC peer connection
  const { peerConnection, setupPeerConnection, handleOffer, handleIceCandidate, closePeerConnection } =
    useWebRTC({
      wsConnection,
      onStatusChange: setScreenShareStatus,
    });

  // Remote commands
  const { isSendingCommand, sendCommand } = useRemoteCommands({
    selectedDevice,
    wsConnection,
    wsUrl,
    onWebSocketReconnect: reconnectWebSocket,
  });

  // Handle WebSocket messages
  function handleWebSocketMessage(message: unknown) {
    const msg = message as {
      type?: string;
      candidate?: string;
      label?: number;
      id?: string;
      data?: { result?: string };
    };

    // Handle ICE candidate without type
    if (msg.candidate && !msg.type) {
      handleIceCandidate({
        candidate: msg.candidate,
        label: msg.label,
        id: msg.id,
      } as never);
      return;
    }

    // Handle different message types
    switch (msg.type) {
      case 'offer':
        handleOffer(msg as RTCSessionDescriptionInit);
        break;
      case 'candidate':
        handleIceCandidate(msg as never);
        break;
      case 'command-response':
        dispatch(
          addToast({
            type: 'success',
            title: 'Command Response',
            message: `Command executed: ${msg.data?.result || 'Success'}`,
          })
        );
        break;
    }
  }

  // Load devices
  const loadDevices = useCallback(async () => {
    try {
      const result = await deviceApi.getDevices();
      if (result.success) {
        setDevices(result.data.data || []);
      } else {
        dispatch(
          addToast({
            type: 'error',
            title: 'Failed to load devices',
            message: result.error?.message || 'Failed to load devices',
          })
        );
      }
    } catch {
      dispatch(
        addToast({
          type: 'error',
          title: 'Failed to load devices',
          message: 'An unexpected error occurred',
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  // Load previous recordings (mock data for now)
  const loadPreviousRecordings = useCallback(async () => {
    if (!selectedDevice) return;

    setPreviousRecordings([
      {
        id: '1',
        deviceId: selectedDevice.id,
        deviceName: selectedDevice.name,
        type: 'screen_recording',
        duration: '2:34',
        timestamp: new Date().toISOString(),
        size: '15.2 MB',
      },
      {
        id: '2',
        deviceId: selectedDevice.id,
        deviceName: selectedDevice.name,
        type: 'audio_recording',
        duration: '1:45',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        size: '8.7 MB',
      },
    ]);
  }, [selectedDevice]);

  // Handle screen share toggle
  const handleScreenShare = async () => {
    if (!selectedDevice) {
      dispatch(
        addToast({
          type: 'error',
          title: 'No Device Selected',
          message: 'Please select a device first',
        })
      );
      return;
    }

    try {
      if (isScreenShareModalOpen) {
        // Close modal and cleanup
        setIsScreenShareModalOpen(false);
        closePeerConnection();
        disconnectWebSocket();
        setScreenShareStatus('disconnected');
      } else {
        // Open modal, connect WebSocket, and setup peer connection
        setIsScreenShareModalOpen(true);
        connectWebSocket(true);
        setupPeerConnection();
        setScreenShareStatus('Connecting...');
      }
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Screen Share Error',
          message: err instanceof Error ? err.message : 'Failed to start screen share',
        })
      );
    }
  };

  // Effects
  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  useEffect(() => {
    if (selectedDevice) {
      loadPreviousRecordings();
    }
  }, [selectedDevice, loadPreviousRecordings]);

  if (isLoading) {
    return (
      <AuthWrapper>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Remote Control</h1>
              <p className="text-gray-600">Control and monitor your devices remotely</p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isScreenShareModalOpen ? 'bg-green-500' : 'bg-gray-400'
                }`}
              ></div>
              <span className="text-sm text-gray-600">
                {isScreenShareModalOpen ? 'Screen Share Active' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Device Selection */}
          <DeviceSelector
            devices={devices}
            selectedDevice={selectedDevice}
            onDeviceSelect={setSelectedDevice}
          />

          {selectedDevice && (
            <>
              {/* Screen Share Section */}
              <ScreenShareSection
                isActive={isScreenShareModalOpen}
                status={screenShareStatus}
                onToggle={handleScreenShare}
              />

              {/* Remote Commands */}
              <CommandButtons
                onCommandClick={sendCommand}
                disabled={isSendingCommand}
              />

              {/* Previous Recordings */}
              <PreviousRecordings recordings={previousRecordings} />
            </>
          )}

          {/* Screen Share Modal */}
          <ScreenShareModal
            isOpen={isScreenShareModalOpen}
            onClose={handleScreenShare}
            deviceName={selectedDevice?.name}
            deviceId={selectedDevice?.id || ''}
            screenShareStatus={screenShareStatus}
            isConnected={isConnected}
          />
        </div>
      </Layout>
    </AuthWrapper>
  );
}

