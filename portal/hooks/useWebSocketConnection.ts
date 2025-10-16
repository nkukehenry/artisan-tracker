import { useState, useCallback, useRef, useEffect } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { addToast } from '@/store/slices/appSlice';

interface UseWebSocketConnectionProps {
  url: string;
  onMessage?: (message: unknown) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

interface UseWebSocketConnectionReturn {
  wsConnection: WebSocket | null;
  isConnected: boolean;
  connect: (isScreenShare?: boolean) => void;
  disconnect: () => void;
  sendMessage: (message: Record<string, unknown>) => boolean;
  reconnect: (isScreenShare?: boolean) => void;
}

export const useWebSocketConnection = ({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
}: UseWebSocketConnectionProps): UseWebSocketConnectionReturn => {
  const dispatch = useAppDispatch();
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  const connect = useCallback((isScreenShare: boolean = false) => {
    // Don't create a new connection if one is already open
    if (wsConnection?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected', isScreenShare);

      if (isScreenShare) {
        console.log('Sending screen share command');
        wsConnection.send(
          JSON.stringify(
            {
              type: 'client-message', action: 'stream_screen',
              duration: 3000, timestamp: Date.now(),
            }));

      }

      return;
    }

    // Close existing connection if it exists
    if (wsConnection) {
      wsConnection.close();
    }

    console.log('Attempting to connect to WebSocket:', url);
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setWsConnection(ws);
      reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection

      if (onOpen) {
        onOpen();
      }

      if (isScreenShare) {
        console.log('Sending screen share command after connection');
        ws.send(
          JSON.stringify(
            {
              type: 'client-message', action: 'stream_screen',
              duration: 3000, timestamp: Date.now(),
            }));
      }
    };

    ws.onmessage = async (event) => {
      try {
        let message = null;

        if (event.data instanceof Blob) {
          const text = await event.data.text();
          message = JSON.parse(text);
        } else {
          message = JSON.parse(event.data);
        }

        console.log('WebSocket message received:', message);

        if (onMessage) {
          onMessage(message);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setIsConnected(false);
      setWsConnection(null);

      // Only attempt to reconnect if it wasn't a manual close and we haven't exceeded max attempts
      if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
        console.log(`Attempting to reconnect (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
        reconnectAttemptsRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect(isScreenShare);
        }, 2000 * reconnectAttemptsRef.current); // Exponential backoff
      } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.log('Max reconnection attempts reached. Stopping reconnection attempts.');
        dispatch(addToast({
          type: 'error',
          title: 'Connection Failed',
          message: 'Unable to establish WebSocket connection after multiple attempts',
        }));
      }

      if (onClose) {
        onClose();
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      console.error('WebSocket readyState:', ws.readyState);
      console.error('WebSocket URL:', ws.url);
      setIsConnected(false);

      // Don't show error toast immediately, let onclose handle reconnection logic
      if (onError) {
        onError(error);
      }
    };

    // Don't set the connection until it's actually open
    // setWsConnection(ws); // This was causing the issue
  }, [url, onMessage, onOpen, onClose, onError, dispatch]);



  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    reconnectAttemptsRef.current = 0; // Reset reconnect attempts on manual disconnect

    if (wsConnection) {
      wsConnection.close(1000, 'Manual disconnect');
      setWsConnection(null);
    }
    setIsConnected(false);
  }, [wsConnection]);

  const sendMessage = useCallback((message: Record<string, unknown>): boolean => {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, [wsConnection]);

  const reconnect = useCallback((isScreenShare: boolean = false) => {
    disconnect();
    reconnectAttemptsRef.current = 0; // Reset attempts for manual reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectTimeoutRef.current = setTimeout(() => {
      connect(isScreenShare);
    }, 2000);
  }, [disconnect, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [wsConnection]);

  return {
    wsConnection,
    isConnected,
    connect,
    disconnect,
    sendMessage,
    reconnect,
  };
};

