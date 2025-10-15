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
  reconnect: () => void;
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

  const connect = useCallback((isScreenShare: boolean = false) => {
    if (wsConnection?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected',isScreenShare);
     
      if (isScreenShare) {
        console.log('Sending screen share command');
        wsConnection.send(
          JSON.stringify(
            { type: 'client-message',action: 'stream_screen',
              duration: 3000, timestamp: Date.now(),
        }));

      }

      return;
    }

    console.log('Attempting to connect to WebSocket:', url);
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setWsConnection(ws);
      
      if (onOpen) {
        onOpen();
      }

      if (isScreenShare) {
       
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
      
      if (onClose) {
        onClose();
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      console.error('WebSocket readyState:', ws.readyState);
      console.error('WebSocket URL:', ws.url);
      setIsConnected(false);
      
      if (onError) {
        onError(error);
      }
    };

    setWsConnection(ws);
  }, [url, wsConnection, onMessage, onOpen, onClose, onError]);

 

  const disconnect = useCallback(() => {
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

  const reconnect = useCallback(() => {
    disconnect();
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
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

