'use client';

import { WebSocketProvider } from '@/contexts/WebSocketContext';

export default function WebSocketProviderWrapper({ children }: { children: React.ReactNode }) {
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080/signaling';

    return (
        <WebSocketProvider url={wsUrl}>
            {children}
        </WebSocketProvider>
    );
}

