# WebSocket Configuration

## Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
# WebSocket Configuration
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:9090/signaling
```

## Development vs Production

### Development
```bash
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:9090/signaling
```

### Production
```bash
NEXT_PUBLIC_WEBSOCKET_URL=wss://tracker.mutindo.com/signaling
```

## How It Works

1. **Device Details Page**: Connects to WebSocket signaling server
2. **Screen Share**: Waits for WebRTC offers from the device
3. **Video Playback**: Displays received video stream in a modal
4. **Real-time Communication**: Handles ICE candidates and connection state

## WebSocket Message Types

- `offer`: WebRTC offer from device
- `candidate`: ICE candidate for connection
- `answer`: WebRTC answer response
- `command-response`: Command execution results

## WebRTC Flow

1. Device sends screen share offer
2. Portal receives offer and creates answer
3. ICE candidates exchanged for connection
4. Video stream established and displayed
