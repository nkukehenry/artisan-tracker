'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { addToast } from '@/store/slices/appSlice';

interface WebSocketContextType {
    wsConnection: WebSocket | null;
    isConnected: boolean;
    connect: (isScreenShare?: boolean) => void;
    disconnect: () => void;
    sendMessage: (message: Record<string, unknown>) => boolean;
    reconnect: (isScreenShare?: boolean) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
    children: ReactNode;
    url: string;
    onMessage?: (message: unknown) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
}

export function WebSocketProvider({
    children,
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
}: WebSocketProviderProps) {
    const dispatch = useAppDispatch();
    const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const wsConnectionRef = useRef<WebSocket | null>(null);
    const maxReconnectAttempts = 3;

    // Keep ref in sync with state
    useEffect(() => {
        wsConnectionRef.current = wsConnection;
    }, [wsConnection]);

    const connect = useCallback((isScreenShare: boolean = false) => {
        // Don't create a new connection if one is already open
        if (wsConnectionRef.current?.readyState === WebSocket.OPEN) {
            console.log('WebSocket already connected');
            return;
        }

        // Close existing connection if it exists
        if (wsConnectionRef.current) {
            wsConnectionRef.current.close();
        }

        console.log('Attempting to connect to WebSocket:', url);
        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
            setWsConnection(ws);
            reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection

            // Register this web client as a device with the signaling server
            const webClientDeviceId = typeof window !== 'undefined'
                ? sessionStorage.getItem('web_client_device_id') || 'web_client'
                : 'web_client';
            ws.send(
                JSON.stringify({
                    type: 'device_registration',
                    deviceId: webClientDeviceId,
                    deviceInfo: {
                        deviceId: webClientDeviceId,
                        platform: 'web',
                        timestamp: Date.now(),
                    }
                })
            );
            console.log('Registered web client device:', webClientDeviceId);

            if (onOpen) {
                onOpen();
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
    }, [url, onMessage, onOpen, onClose, onError, dispatch]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on manual disconnect

        if (wsConnectionRef.current) {
            wsConnectionRef.current.close(1000, 'Manual disconnect');
            setWsConnection(null);
        }
        setIsConnected(false);
    }, []);

    const sendMessage = useCallback((message: Record<string, unknown>): boolean => {
        if (wsConnectionRef.current && wsConnectionRef.current.readyState === WebSocket.OPEN) {
            wsConnectionRef.current.send(JSON.stringify(message));
            return true;
        }
        return false;
    }, []);

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
            if (wsConnectionRef.current) {
                wsConnectionRef.current.close();
            }
        };
    }, []);

    const value: WebSocketContextType = {
        wsConnection,
        isConnected,
        connect,
        disconnect,
        sendMessage,
        reconnect,
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocketContext() {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocketContext must be used within a WebSocketProvider');
    }
    return context;
}

/**
 * Hook to set up a message listener on the WebSocket connection.
 * Automatically adds and removes the listener when the connection changes.
 * 
 * Note: The handler function should be wrapped in useCallback to avoid unnecessary re-subscriptions.
 * 
 * @param handler - Function to call when a message is received
 */
export function useWebSocketMessage(handler: (message: unknown) => void) {
    const { wsConnection } = useWebSocketContext();
    const handlerRef = useRef(handler);

    // Keep handler ref up to date
    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        if (!wsConnection) return;

        const messageHandler = async (event: MessageEvent) => {
            try {
                let message = null;

                if (event.data instanceof Blob) {
                    const text = await event.data.text();
                    message = JSON.parse(text);
                } else {
                    message = JSON.parse(event.data as string);
                }

                handlerRef.current(message);
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };

        wsConnection.addEventListener('message', messageHandler);

        return () => {
            wsConnection.removeEventListener('message', messageHandler);
        };
    }, [wsConnection]);
}

