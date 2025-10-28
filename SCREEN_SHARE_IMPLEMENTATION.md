# Screen Share Implementation

## Overview
Implemented screen share functionality that allows web clients to request screen streaming from Android devices using WebRTC signaling.

## Flow

### 1. User Initiates Screen Share
- User clicks "Screen Share" button in the remote control interface
- Modal opens with video element ready for remote stream
- Status shows "Connecting..."

### 2. Command Routing
The system sends a properly routed command to the Android device:

```typescript
{
  type: 'client-message',
  deviceId: 'web_1234567890_abc123',        // Web client sender ID
  targetDeviceId: 'android_device_xyz',     // Target Android device
  action: 'stream_screen',
  duration: 30000,                           // 30 seconds
  timestamp: Date.now()
}
```

### 3. Signaling Server Routing
- Signaling server receives the `client-message`
- Looks up the `targetDeviceId` in its device channels
- Routes message to the specific Android device's channel
- Android device receives the command and starts preparing the stream

### 4. WebRTC Flow
1. **Android device creates offer** → Sends to signaling server with `deviceId` and `targetDeviceId`
2. **Signaling server routes offer** → Forwards to web client based on `targetDeviceId`
3. **Web client receives offer** → Creates answer and sends back
4. **Signaling server routes answer** → Forwards to Android device
5. **ICE candidates exchanged** → Both sides exchange network candidates
6. **Connection established** → Video stream starts flowing

### 5. Status Updates
The screen share modal shows status updates:
- "Connecting..." - Initial state
- "Waiting for offer..." - Command sent, waiting for Android to start streaming
- "Connected - waiting for offer" - Success response received
- "Live" - Stream is active
- "error" - Connection failed
- "Disconnected" - Stream ended

## Implementation Details

### Remote Control Page (`portal/app/remote-control/page.tsx`)

#### Key Features:
1. **Pending Command Management**: If WebSocket is not connected when screen share is clicked, sets a flag to send the command once connected
2. **Device ID Routing**: Uses `webClientDeviceId` (sender) and `selectedDevice.deviceId` (target)
3. **Status Tracking**: Updates UI status based on WebRTC connection state
4. **Message Handling**: Processes offers, answers, and ICE candidates

#### Screen Share Handler:
```typescript
const handleScreenShare = async () => {
  if (!isScreenShareModalOpen) {
    // Open modal and setup
    setIsScreenShareModalOpen(true);
    setupPeerConnection();
    
    // Send stream_screen command
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(JSON.stringify({
        type: 'client-message',
        deviceId: webClientDeviceId,
        targetDeviceId: selectedDevice.deviceId,
        action: 'stream_screen',
        duration: 30000,
        timestamp: Date.now(),
      }));
      setScreenShareStatus('Waiting for offer...');
    } else {
      setPendingScreenShareCommand(true);
    }
  }
};
```

### WebSocket Connection (`portal/hooks/useWebSocketConnection.ts`)

#### Changes:
- **Device Registration**: Automatically registers web client on connect
- **Removed auto-send**: No longer sends stream_screen command automatically
- **Pending command handling**: Sends pending commands when connection opens

### WebRTC Hook (`portal/hooks/useWebRTC.ts`)

#### Features:
- **Device ID Routing**: Includes `webClientDeviceId` and `targetDeviceId` in all signaling messages
- **ICE Candidate Handling**: Properly routes ICE candidates to target device
- **Answer Creation**: Creates WebRTC answer when offer is received
- **Status Updates**: Updates connection status through callback

#### Message Format:
```typescript
// ICE Candidate
{
  type: 'candidate',
  deviceId: webClientDeviceId,
  targetDeviceId: targetDeviceId,
  candidate: event.candidate.candidate,
  label: event.candidate.sdpMLineIndex,
  id: event.candidate.sdpMid,
}

// Answer
{
  type: 'answer',
  deviceId: webClientDeviceId,
  targetDeviceId: targetDeviceId,
  sdp: answer.sdp,
}
```

### Screen Share Modal (`portal/components/devices/ScreenShareModal.tsx`)

#### Display:
- Shows video element with id="remoteVideo"
- Display status overlay (connected, connecting, error)
- Shows device name and ID
- Full-screen modal design

## Expected Android Device Behavior

When Android device receives `stream_screen` command:

1. **Create PeerConnection** with configuration
2. **Create Video Track** from MediaProjection
3. **Create Offer** with video track
4. **Send Offer** through WebSocket with device IDs:
   ```json
   {
     "type": "offer",
     "deviceId": "android_device_xyz",
     "targetDeviceId": "web_1234567890_abc123",
     "sdp": "..."
   }
   ```
5. **Receive Answer** from web client
6. **Exchange ICE Candidates** to establish connection
7. **Stream Video** once connection is established

## Message Flow Diagram

```
Web Client                    Signaling Server                  Android Device
     |                                |                               |
     |--[stream_screen]-------------->|                               |
     |                                |---[stream_screen]------------->|
     |                                |                               |
     |                                |<--[offer + deviceId]----------|
     |<--[offer]----------------------|                               |
     |                                                                |
     |--[answer + deviceId]---------->|                               |
     |                                |--[answer]-------------------->|
     |                                                                |
     |<--[candidate]------------------|                               |
     |--[candidate]------------------>|--[candidate]----------------->|
     |                                                                |
     |<--[candidate]------------------|                               |
     |                                                                |
     |<======= VIDEO STREAM ========>|                               |
     |                                                                |
```

## Testing

To test the screen share functionality:

1. **Start Backend**: Ensure signaling server is running
2. **Connect Android Device**: Android app connects and registers
3. **Select Device**: Choose Android device in web portal
4. **Click Screen Share**: Modal opens, command sent
5. **Verify Stream**: Video should appear in modal

## Troubleshooting

### Stream doesn't start
- Check console for WebSocket messages
- Verify device IDs are being sent correctly
- Ensure Android device receives command
- Check WebRTC connection state

### Wrong device receives command
- Verify `targetDeviceId` matches Android device
- Check device registration on signaling server
- Verify channel subscriptions

### Connection timeout
- Check network connectivity
- Verify STUN/TURN servers accessible
- Check firewall settings

## Future Enhancements

1. **Reconnection logic** for dropped connections
2. **Quality settings** (resolution, bitrate)
3. **Audio support** for screen recording
4. **Recording functionality** to save screen shares
5. **Multi-device support** for viewing multiple screens


