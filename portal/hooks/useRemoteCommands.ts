import { useState, useCallback } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { addToast, setLoading } from '@/store/slices/appSlice';
import { Device } from '@/types/device';

interface UseRemoteCommandsProps {
  selectedDevice: Device | null;
  wsConnection: WebSocket | null;
  wsUrl: string;
  onWebSocketReconnect: () => void;
}

interface UseRemoteCommandsReturn {
  isSendingCommand: boolean;
  sendCommand: (command: string, payload?: Record<string, unknown>) => Promise<void>;
}

export const useRemoteCommands = ({
  selectedDevice,
  wsConnection,
  wsUrl,
  onWebSocketReconnect,
}: UseRemoteCommandsProps): UseRemoteCommandsReturn => {
  const dispatch = useAppDispatch();
  const [isSendingCommand, setIsSendingCommand] = useState(false);

  const sendCommand = useCallback(
    async (command: string, payload?: Record<string, unknown>) => {
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

      dispatch(setLoading({ isLoading: true, message: 'Sending command...' }));

      if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
        console.log('WebSocket connection not active. Attempting to reconnect...');
        
        setTimeout(() => {
          if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
            console.log('WebSocket reconnected. Resending command...');
            sendCommand(command, payload);
          } else {
            dispatch(
              addToast({
                type: 'error',
                title: 'Failed to send command',
                message: 'WebSocket connection not active. Please try again.',
              })
            );
            dispatch(setLoading({ isLoading: false, message: '' }));
          }
        }, 2000);

        onWebSocketReconnect();
        return;
      }

      setIsSendingCommand(true);
      try {
        const commandPayload = {
          type: 'client-message',
          action: command,
          deviceId: selectedDevice.deviceId,
          duration: (payload?.duration as number) || 30,
          timestamp: Date.now(),
        };

        console.log('Sending command via WebSocket:', commandPayload);
        wsConnection.send(JSON.stringify(commandPayload));

        dispatch(
          addToast({
            type: 'success',
            title: 'Command Sent',
            message: `${command.replace(/_/g, ' ')} command sent successfully`,
          })
        );
      } catch (error) {
        console.error('Error sending command:', error);
        dispatch(
          addToast({
            type: 'error',
            title: 'Failed to send command',
            message: error instanceof Error ? error.message : 'An unexpected error occurred',
          })
        );
      } finally {
        setIsSendingCommand(false);
        dispatch(setLoading({ isLoading: false, message: 'Command sent successfully' }));
      }
    },
    [selectedDevice, wsConnection, wsUrl, onWebSocketReconnect, dispatch]
  );

  return {
    isSendingCommand,
    sendCommand,
  };
};

