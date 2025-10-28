# WebSocket Channel-Based Routing Refactor Summary

## Overview
Refactored the signaling service and remote control interface to support channel-based device management with proper device identification and routing.

## Changes Made

### 1. Signaling Service (`backend/src/services/signaling.service.ts`)

#### Added Features:
- **Device Registration System**: Tracks devices by unique device IDs
- **Channel Management**: Devices can subscribe/unsubscribe from channels
- **Device-Specific Channels**: Automatic `device_{deviceId}` channel creation
- **Message Routing**: 
  - Direct to specific device
  - Channel-based broadcasting
  - Device-to-device communication
- **Heartbeat System**: 90-second timeout, devices removed if no heartbeat
- **Client/Device Distinction**: Differentiates between web clients and Android devices

#### Message Types Supported:
- `device_registration` - Register a device
- `device_heartbeat` - Keep device alive
- `client-message` - Send commands/actions
- `channel_join` / `channel_leave` - Manage channel subscriptions
- `get_connected_devices` - List all connected devices
- WebRTC signaling (`offer`, `answer`, `candidate`)

### 2. Remote Control Page (`portal/app/remote-control/page.tsx`)

#### Key Changes:
- **Web Client Device ID Generation**: Creates unique ID (`web_timestamp_random`) persisted in sessionStorage
- **Device ID Management**: Web client device ID extracted from sessionStorage
- **Message Routing**: Commands now routed to specific target devices using channel system

#### Device ID Flow:
```typescript
// Web client gets unique ID on mount
const webClientDeviceId = useMemo(() => getWebClientDeviceId(), []);

// Commands include:
- deviceId: webClientDeviceId (sender - web client)
- targetDeviceId: selectedDevice.deviceId (receiver - Android device)
```

### 3. WebSocket Connection Hook (`portal/hooks/useWebSocketConnection.ts`)

#### Changes:
- **Device Registration on Connect**: Automatically registers web client when WebSocket opens
- **Registration Message**: Sends `device_registration` message with web client info

```typescript
ws.send(JSON.stringify({
  type: 'device_registration',
  deviceId: webClientDeviceId,
  deviceInfo: {
    deviceId: webClientDeviceId,
    platform: 'web',
    timestamp: Date.now(),
  }
}));
```

### 4. Remote Commands Hook (`portal/hooks/useRemoteCommands.ts`)

#### Changes:
- **Added webClientDeviceId parameter**: Pass the web client's device ID
- **Updated message format**: Commands now include routing information

```typescript
const commandPayload = {
  type: 'client-message',
  action: command,
  deviceId: webClientDeviceId,        // Sender ID
  targetDeviceId: selectedDevice.deviceId,  // Target Android device
  duration: duration || 30,
  timestamp: Date.now(),
};
```

### 5. WebRTC Hook (`portal/hooks/useWebRTC.ts`)

#### Changes:
- **Added device ID parameters**: webClientDeviceId and targetDeviceId
- **ICE Candidate Messages**: Include device IDs for proper routing
- **Answer Messages**: Include device IDs for channel routing

```typescript
const candidateMessage = {
  type: 'candidate',
  deviceId: webClientDeviceId,
  targetDeviceId: targetDeviceId,
  // ... candidate data
};
```

## Message Flow

### Command Flow:
1. Web client generates unique device ID on mount
2. Web client registers with signaling server on WebSocket connect
3. User selects Android device from global device context
4. Command includes:
   - `deviceId`: Web client's device ID
   - `targetDeviceId`: Selected Android device ID
5. Signaling server routes message to specific device channel
6. Android device receives command on its channel

### WebRTC Flow:
1. Web client sends ICE candidates with device IDs
2. Signaling server routes to target Android device
3. Android device responds with answer/candidate
4. Signaling server routes back to web client
5. Peer connection established between specific devices

## Benefits

1. **Proper Device Identification**: Each connection has a unique device ID
2. **Targeted Messaging**: Commands go to specific devices, not broadcast to all
3. **Scalability**: Support for multiple web clients controlling multiple Android devices
4. **Channel Isolation**: Devices can join specific channels for group communication
5. **Backward Compatibility**: Existing functionality preserved
6. **Heartbeat System**: Automated cleanup of stale connections

## Configuration

### Environment Variables:
- `NEXT_PUBLIC_WEBSOCKET_URL`: WebSocket server URL (default: `ws://localhost:9090/signaling`)

### Session Storage:
- `web_client_device_id`: Automatically generated and persisted for session

## Usage

### For Web Clients:
- Device ID automatically generated on first load
- Automatically registered on WebSocket connection
- Target device selected from global device context

### For Android Devices:
- Must send `device_registration` message on connect
- Must send `device_heartbeat` messages periodically (every ~30 seconds)
- Receives commands on `device_{deviceId}` channel

## Testing

To test the channel system:
1. Connect multiple devices to the signaling server
2. Send commands from web client with specific `targetDeviceId`
3. Verify messages are routed correctly
4. Test heartbeat system by simulating device timeout
5. Verify channel subscriptions work correctly

## Next Steps

Consider adding:
1. Broadcast to all devices (no targetDeviceId)
2. Broadcast to channel (using targetChannel)
3. Admin commands to all devices
4. Device presence notifications
5. Channel-based device grouping


