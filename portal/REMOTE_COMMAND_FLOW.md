# Remote Command Flow Documentation

## Overview
Remote commands are now sent directly via WebSocket instead of HTTP API calls. This provides real-time communication with the device.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Remote Control Page                       │
│                                                                   │
│  ┌────────────────────┐        ┌──────────────────────────┐    │
│  │  Command Buttons   │        │   Screen Share Button    │    │
│  │                    │        │                          │    │
│  │  • Take Photo      │        │  • Start Live View       │    │
│  │  • Record Audio    │        │  • Stop Live View        │    │
│  │  • Record Video    │        │                          │    │
│  │  • Get Location    │        │  Uses: WebRTC + WebSocket│    │
│  │  • Get Contacts    │        └──────────────────────────┘    │
│  │  • Get Call Logs   │                                         │
│  │  • Get Messages    │                                         │
│  │  • Restart Device  │                                         │
│  │  • Wipe Data       │                                         │
│  └────────────────────┘                                         │
│           │                                                      │
│           │ sendCommand()                                        │
│           ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           WebSocket Connection Manager                   │   │
│  │  • connectWebSocket()                                    │   │
│  │  • disconnectWebSocket()                                 │   │
│  │  • sendMessage()                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ WebSocket
                                │ ws://localhost:9090/signaling
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      WebSocket Server                            │
│                   (Port 9090 - Signaling)                        │
│                                                                   │
│  • Routes messages between clients and devices                   │
│  • Handles WebRTC signaling (offer/answer/candidates)           │
│  • Forwards remote commands to connected devices                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ WebSocket
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Android/iOS Device                           │
│                                                                   │
│  • Receives commands via WebSocket                               │
│  • Executes requested actions                                    │
│  • Sends responses back via WebSocket                            │
│  • Streams screen via WebRTC (for live view)                    │
└─────────────────────────────────────────────────────────────────┘
```

## Command Flow

### 1. **Remote Commands** (Take Photo, Record Audio, etc.)

```typescript
User Clicks Button
      ↓
sendCommand(command: CommandType)
      ↓
Create Payload:
{
  type: "client-message",
  action: "TAKE_PHOTO",      // Command type
  deviceId: "device-123",     // Target device
  timestamp: 1234567890,      // Current timestamp
  ...additionalPayload        // Any extra parameters
}
      ↓
wsConnection.send(JSON.stringify(payload))
      ↓
WebSocket Server
      ↓
Device receives and executes command
      ↓
Device sends response via WebSocket
      ↓
ws.onmessage handles response
      ↓
Show success toast to user
```

### 2. **Screen Share / Live View**

```typescript
User Clicks "Start Live View"
      ↓
handleScreenShare()
      ↓
connectWebSocket(true)  // Connect with screen share flag
      ↓
setupPeerConnection()   // Setup WebRTC
      ↓
Send screen share command:
{
  type: "client-message",
  action: "stream_screen",
  duration: 3000,
  timestamp: Date.now()
}
      ↓
Device creates WebRTC offer
      ↓
Client receives offer via WebSocket
      ↓
handleWebRTCOffer()
      ↓
Create and send answer
      ↓
Exchange ICE candidates
      ↓
WebRTC connection established
      ↓
Video stream displayed in modal
```

## Message Formats

### Command Message (Client → Device)
```json
{
  "type": "client-message",
  "action": "TAKE_PHOTO",
  "deviceId": "device-123",
  "timestamp": 1234567890
}
```

### Command Types
- `TAKE_PHOTO` - Capture photo from camera
- `RECORD_AUDIO` - Record audio
- `RECORD_VIDEO` - Record video
- `GET_LOCATION` - Get current GPS location
- `GET_CONTACTS` - Retrieve contacts list
- `GET_CALL_LOGS` - Retrieve call history
- `GET_MESSAGES` - Retrieve messages
- `RESTART_DEVICE` - Restart the device
- `WIPE_DATA` - Wipe device data (destructive!)

### Screen Share Message (Client → Device)
```json
{
  "type": "client-message",
  "action": "stream_screen",
  "duration": 3000,
  "timestamp": 1234567890
}
```

### WebRTC Offer (Device → Client)
```json
{
  "type": "offer",
  "offer": {
    "type": "offer",
    "sdp": "v=0\r\no=- 123456789 2 IN IP4..."
  },
  "deviceId": "device-123"
}
```

### WebRTC Answer (Client → Device)
```json
{
  "type": "answer",
  "sdp": "v=0\r\no=- 987654321 2 IN IP4..."
}
```

### ICE Candidate
```json
{
  "type": "candidate",
  "candidate": "candidate:123456...",
  "sdpMLineIndex": 0,
  "sdpMid": "0",
  "label": 0,
  "id": "0"
}
```

### Command Response (Device → Client)
```json
{
  "type": "command-response",
  "action": "TAKE_PHOTO",
  "success": true,
  "data": {
    "result": "Photo captured",
    "filePath": "/storage/photos/photo_123.jpg",
    "fileSize": 2048000
  }
}
```

## Implementation Details

### WebSocket Connection Management

```typescript
// Connect when device is selected
useEffect(() => {
  if (selectedDevice && !wsConnection) {
    connectWebSocket();
  }
}, [selectedDevice]);

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (wsConnection) {
      wsConnection.close();
    }
  };
}, [wsConnection]);
```

### Connection Status Checks

```typescript
if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
  // Show error: Not connected
  return;
}
```

### Error Handling

```typescript
try {
  wsConnection.send(JSON.stringify(payload));
  // Show success toast
} catch (error) {
  console.error('Error sending command:', error);
  // Show error toast
}
```

## Benefits of WebSocket Commands

### ✅ **Advantages**

1. **Real-Time Communication**
   - Instant command delivery
   - No HTTP polling required
   - Bi-directional communication

2. **Lower Latency**
   - Direct connection to device
   - No HTTP request/response overhead
   - Faster command execution

3. **Better Resource Usage**
   - Single persistent connection
   - Less network overhead
   - More efficient than HTTP

4. **Live Feedback**
   - Instant status updates
   - Real-time responses
   - Progress notifications

5. **Connection State Awareness**
   - Know immediately if device disconnects
   - Can disable commands when offline
   - Better UX with connection status

### ⚠️ **Considerations**

1. **Connection Management**
   - Must handle reconnections
   - Need to detect disconnects
   - Store commands when offline?

2. **Error Handling**
   - WebSocket errors different from HTTP
   - Need timeout for commands
   - Handle network issues gracefully

3. **Security**
   - Ensure WebSocket is secured (WSS)
   - Validate all messages
   - Authenticate connections

## User Experience

### Connection Status Indicator
```typescript
<div className={`w-3 h-3 rounded-full ${
  isScreenShareModalOpen ? 'bg-green-500' : 'bg-gray-400'
}`}></div>
```

### Command Button State
```typescript
<button
  disabled={isSendingCommand || !wsConnection}
  className={isSendingCommand ? 'opacity-50 cursor-not-allowed' : ''}
>
  {isSendingCommand ? 'Sending...' : 'Send Command'}
</button>
```

### Toast Notifications
- ✅ Success: "Command sent successfully"
- ❌ Error: "WebSocket connection not active"
- ⚠️ Warning: "Device may be offline"

## Testing

### Manual Testing Checklist
- [ ] Connect to device
- [ ] Send each command type
- [ ] Verify toast notifications
- [ ] Test with device offline
- [ ] Test WebSocket reconnection
- [ ] Test rapid command sending
- [ ] Test screen share + commands together
- [ ] Verify command responses
- [ ] Check console logs for errors

### WebSocket Testing
```javascript
// Test command via browser console
const ws = new WebSocket('ws://localhost:9090/signaling');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'client-message',
    action: 'TAKE_PHOTO',
    deviceId: 'device-123',
    timestamp: Date.now()
  }));
};
ws.onmessage = (event) => console.log('Response:', event.data);
```

## Debugging

### Enable Verbose Logging
```typescript
ws.onmessage = (event) => {
  console.log('📩 Message received:', event.data);
  // ... handle message
};

wsConnection.send(JSON.stringify(payload));
console.log('📤 Command sent:', payload);
```

### Check Connection State
```typescript
console.log('WebSocket state:', {
  readyState: wsConnection?.readyState,
  url: wsConnection?.url,
  states: {
    0: 'CONNECTING',
    1: 'OPEN',
    2: 'CLOSING',
    3: 'CLOSED'
  }
});
```

## Migration Notes

### Before (HTTP API)
```typescript
const result = await commandApi.sendCommand(deviceId, commandData);
if (result.success) {
  // Handle success
}
```

### After (WebSocket)
```typescript
wsConnection.send(JSON.stringify({
  type: 'client-message',
  action: command,
  deviceId: deviceId,
  timestamp: Date.now()
}));
// Success toast shown immediately
// Response handled in ws.onmessage
```

## Future Enhancements

- [ ] Command queue for offline mode
- [ ] Retry failed commands
- [ ] Command history/logs
- [ ] Batch command sending
- [ ] Command templates/macros
- [ ] Scheduled commands
- [ ] Command responses in UI
- [ ] Real-time command progress

---

**Last Updated:** January 2024  
**Version:** 1.2.0

