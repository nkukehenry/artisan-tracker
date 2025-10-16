'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { useDeviceContext } from '@/contexts/DeviceContext';
import { useAppDispatch } from '@/lib/hooks';
import { addToast } from '@/store/slices/appSlice';
import ScreenShareModal from '@/components/devices/ScreenShareModal';
import ScreenShareSection from '@/components/remote-control/ScreenShareSection';
import CommandButtons from '@/components/remote-control/CommandButtons';
import PreviousRecordings from '@/components/remote-control/PreviousRecordings';
import { useWebSocketConnection } from '@/hooks/useWebSocketConnection';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useRemoteCommands } from '@/hooks/useRemoteCommands';
import { Smartphone } from 'lucide-react';

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
  const { selectedDevice } = useDeviceContext();
  const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:9090/signaling';

  const [isConnecting, setIsConnecting] = useState(false);
  const [isScreenShareModalOpen, setIsScreenShareModalOpen] = useState(false);
  const [screenShareStatus, setScreenShareStatus] = useState('disconnected');
  const [previousRecordings, setPreviousRecordings] = useState<Recording[]>([]);

  // WebSocket connection
  const {
    wsConnection,
    isConnected,
    connect: connectWebSocket,
    reconnect: reconnectWebSocket,
  } = useWebSocketConnection({
    url: wsUrl,
    onMessage: handleWebSocketMessage,
    onOpen: () => {
      setScreenShareStatus('Connected');
      setIsConnecting(false); // Connection established
    },
    onClose: () => {
      setScreenShareStatus('disconnected');
      setIsConnecting(false); // Stop loading on close
    },
    onError: () => {
      setScreenShareStatus('error');
      setIsConnecting(false); // Stop loading on error
    },
  });

  // WebRTC peer connection
  const { peerConnection, setupPeerConnection, handleOffer, handleIceCandidate } =
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


  // Load previous recordings (mock data for now)
  const loadPreviousRecordings = useCallback(async () => {
    if (!selectedDevice) return;

    setPreviousRecordings([
      {
        id: '1',
        deviceId: selectedDevice.deviceId,
        deviceName: selectedDevice.name,
        type: 'screen_recording',
        duration: '2:34',
        timestamp: new Date().toISOString(),
        size: '15.2 MB',
      },
      {
        id: '2',
        deviceId: selectedDevice.deviceId,
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
        // closePeerConnection();
        // disconnectWebSocket();
        // setScreenShareStatus('disconnected');
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
    if (selectedDevice) {
      loadPreviousRecordings();

      // Auto-connect WebSocket and setup peer connection when device is selected
      if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
        console.log('Auto-connecting WebSocket for device:', selectedDevice.name);
        setIsConnecting(true); // Show loading state

        // Set a timeout to stop loading if connection takes too long
        const connectionTimeout = setTimeout(() => {
          setIsConnecting(false);
          console.log('WebSocket connection timeout');
        }, 10000); // 10 second timeout

        connectWebSocket(false); // false = not screen share, just connection

        // Clear timeout if connection succeeds
        const checkConnection = () => {
          if (wsConnection?.readyState === WebSocket.OPEN) {
            clearTimeout(connectionTimeout);
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      }

      if (!peerConnection) {
        console.log('Auto-setting up peer connection for device:', selectedDevice.name);
        setupPeerConnection();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDevice]); // Only depend on selectedDevice to prevent infinite loops

  if (!selectedDevice) {
    return (
      <AuthWrapper>
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <Smartphone className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Device Selected</h2>
            <p className="text-gray-600 mb-6">
              Please select a device from the dropdown in the header to start remote control.
            </p>
          </div>
        </Layout>
      </AuthWrapper>
    );
  }

  // Full screen loader while connecting (same as initial loading)
  if (isConnecting) {
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
                className={`w-3 h-3 rounded-full ${wsConnection && wsConnection.readyState === WebSocket.OPEN
                  ? 'bg-green-500'
                  : wsConnection && wsConnection.readyState === WebSocket.CONNECTING
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                  }`}
              ></div>
              <span className="text-sm text-gray-600">
                {wsConnection && wsConnection.readyState === WebSocket.OPEN
                  ? 'Connected'
                  : wsConnection && wsConnection.readyState === WebSocket.CONNECTING
                    ? 'Connecting...'
                    : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Device Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Selected Device</h2>
              {wsConnection && wsConnection.readyState !== WebSocket.OPEN && (
                <button
                  onClick={() => {
                    setIsConnecting(true);
                    connectWebSocket(false);
                  }}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry Connection
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${selectedDevice.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <div className="font-medium text-gray-900">{selectedDevice.name}</div>
                <div className="text-sm text-gray-500">{selectedDevice.deviceId} • {selectedDevice.model}</div>
              </div>
            </div>
          </div>

          {/* Screen Share Section */}
          <ScreenShareSection
            isActive={isScreenShareModalOpen}
            status={screenShareStatus}
            onToggle={handleScreenShare}
          />

          {/* Remote Commands */}
          <CommandButtons
            onCommandClick={(action, duration) => sendCommand(action, duration ? { duration } : undefined)}
            disabled={isSendingCommand}
          />

          {/* Previous Recordings */}
          <PreviousRecordings recordings={previousRecordings} />

          {/* Screen Share Modal */}
          <ScreenShareModal
            isOpen={isScreenShareModalOpen}
            onClose={handleScreenShare}
            deviceName={selectedDevice?.name}
            deviceId={selectedDevice?.deviceId || ''}
            screenShareStatus={screenShareStatus}
            isConnected={isConnected}
          />
        </div>
      </Layout>
    </AuthWrapper>
  );
}

