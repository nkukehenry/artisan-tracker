import { Server as HTTPServer } from 'http';
import WebSocket from 'ws';
import { logger } from '../config/logger';

interface DeviceInfo {
  deviceId: string;
  platform?: string;
  timestamp: number;
  [key: string]: any;
}

interface RTCSessionDescription {
  type: RTCSdpType;
  sdp?: string;
}

interface Message {
  type?: string;
  deviceId?: string;
  action?: string;
  duration?: number;
  payload?: any;
  targetDeviceId?: string;
  targetChannel?: string;
  channel?: string;
  deviceInfo?: DeviceInfo;
  sdp?: RTCSessionDescription;
  candidate?: string;
  label?: number;
  id?: string;
  sdpMLineIndex?: number;
  sdpMid?: string;
  data?: any;
  fromDevice?: string; // Sender device ID (used when deviceId is set to recipient)
}

enum RTCSdpType {
  offer = 'offer',
  answer = 'answer',
  pranswer = 'pranswer',
  rollback = 'rollback'
}

export class SignalingService {
  private wss: WebSocket.Server;
  private deviceChannels: Map<string, WebSocket>; // deviceId -> WebSocket
  private channelSubscriptions: Map<string, Set<string>>; // channelName -> Set<deviceId>
  private deviceInfo: Map<string, DeviceInfo>; // deviceId -> deviceInfo
  private heartbeatTimers: Map<string, NodeJS.Timeout>; // deviceId -> timer
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private readonly DEVICE_TIMEOUT = 120000; // 90 seconds
  private readonly MAX_CHANNELS_PER_DEVICE = 5;

  constructor(server: HTTPServer) {
    // Create WebSocket server on /signaling path
    this.wss = new WebSocket.Server({
      server,
      path: '/signaling'
    });

    this.deviceChannels = new Map();
    this.channelSubscriptions = new Map();
    this.deviceInfo = new Map();
    this.heartbeatTimers = new Map();

    this.initialize();
  }

  private initialize(): void {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const clientIp = req.socket.remoteAddress;

      logger.info('WebSocket client connected', {
        clientIp,
        totalClients: this.wss.clients.size,
        path: req.url
      });

      // Handle incoming messages
      ws.on('message', (message: WebSocket.Data) => {
        try {
          const messageStr = message.toString();
          logger.debug('Received WebSocket message', {
            clientIp,
            messageLength: messageStr.length
          });

          const parsed = JSON.parse(messageStr) as Message;
          this.handleMessage(ws, parsed);
        } catch (error) {
          logger.error('Error handling WebSocket message', { error, clientIp, message: message.toString() });
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        logger.info('WebSocket client disconnected', {
          clientIp,
          remainingClients: this.wss.clients.size
        });
        this.handleDisconnection(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error('WebSocket error', { error, clientIp });
        this.handleDisconnection(ws);
      });

      // Handle pong (for keep-alive)
      ws.on('pong', () => {
        (ws as any).isAlive = true;
      });
    });

    // Set up ping interval for connection health check
    this.setupHeartbeat();

    logger.info('WebSocket signaling server initialized', {
      path: '/signaling'
    });
  }

  private handleMessage(ws: WebSocket, message: Message): void {
    const { type, deviceId } = message;

    logger.debug('Handling message', { type, deviceId });

    switch (type) {
      case 'device_registration':
        this.handleDeviceRegistration(ws, message);
        break;
      case 'device_heartbeat':
        this.handleHeartbeat(ws, message);
        break;
      case 'client-message':
        this.handleClientMessage(ws, message);
        break;
      case 'channel_join':
        this.handleChannelJoin(ws, message);
        break;
      case 'channel_leave':
        this.handleChannelLeave(ws, message);
        break;
      case 'get_connected_devices':
        this.handleGetConnectedDevices(ws, message);
        break;
      case 'offer':
      case 'answer':
      case 'candidate':
        this.handleWebRTCSignaling(ws, message);
        break;
      case 'connected':
      case 'success':
      case 'error':
      case 'server_message':
      case 'server_response':
      case 'connected_devices':
        // Server-generated messages, ignore if received back
        logger.debug(`Received server-generated message type: ${type}, ignoring`);
        break;
      default:
        // Fallback to broadcast for unknown types (backward compatibility)
        logger.warn('Unknown message type, broadcasting', { type });
        this.broadcast(ws, JSON.stringify(message));
    }
  }

  /**
   * Handle device registration
   */
  private handleDeviceRegistration(ws: WebSocket, message: Message): void {
    const { deviceId, deviceInfo } = message;

    if (!deviceId) {
      this.sendError(ws, 'Device ID is required');
      return;
    }

    // Store device connection and info
    this.deviceChannels.set(deviceId, ws);
    const deviceInfoData: DeviceInfo = {
      ...deviceInfo,
      deviceId,
      timestamp: Date.now(),
    };
    this.deviceInfo.set(deviceId, deviceInfoData);

    // Create device-specific channel
    const deviceChannel = `device_${deviceId}`;
    this.subscribeToChannel(deviceId, deviceChannel);

    // Start heartbeat monitoring
    this.startHeartbeatMonitoring(deviceId);

    // Send registration success
    this.sendSuccess(ws, deviceId, 'Device registered successfully', {
      channel: deviceChannel,
      deviceId: deviceId
    });

    logger.info('Device registered', { deviceId, totalDevices: this.deviceChannels.size });
  }

  /**
   * Handle heartbeat messages
   */
  private handleHeartbeat(ws: WebSocket, message: Message): void {
    const { deviceId } = message;

    if (deviceId && this.deviceChannels.has(deviceId)) {
      // Reset heartbeat timer
      this.resetHeartbeatTimer(deviceId);
      logger.debug('Heartbeat received', { deviceId });
    }
  }

  /**
   * Handle client messages (actions, commands)
   */
  private handleClientMessage(ws: WebSocket, message: Message): void {
    const { deviceId, action, duration, payload, targetDeviceId, targetChannel } = message;

    if (!deviceId) {
      this.sendError(ws, 'Device ID is required');
      return;
    }

    logger.debug('Client message received', { deviceId, action });

    // Determine routing strategy
    if (targetDeviceId) {
      // Route to specific Android device
      this.sendToDevice(targetDeviceId, {
        type: 'server_message',
        deviceId: targetDeviceId,
        action,
        duration,
        payload: payload ? JSON.stringify(payload) : undefined,
        fromDevice: deviceId,
        timestamp: Date.now()
      });
    } else if (targetChannel) {
      // Route to specific channel
      this.sendToChannel(targetChannel, {
        type: 'server_message',
        action,
        duration,
        payload: payload ? JSON.stringify(payload) : undefined,
        fromDevice: deviceId,
        timestamp: Date.now()
      }, deviceId);
    } else {
      // Default: Broadcast to all Android devices (exclude web clients)
      this.broadcastToAndroidDevices({
        type: 'server_message',
        action,
        duration,
        payload: payload ? JSON.stringify(payload) : undefined,
        fromDevice: deviceId,
        timestamp: Date.now()
      }, deviceId);
    }

    // Send confirmation back to sender
    this.sendServerMessage(deviceId, {
      type: 'server_response',
      deviceId,
      action,
      status: 'routed',
      timestamp: Date.now(),
      data: { duration, payload, targetDeviceId, targetChannel }
    });
  }

  /**
   * Handle WebRTC signaling messages (offer, answer, candidate)
   */
  private handleWebRTCSignaling(ws: WebSocket, message: Message): void {
    const { deviceId, type, targetDeviceId } = message;

    logger.debug('WebRTC signaling message', { type, deviceId, targetDeviceId });

    // For offer and answer, targetDeviceId is strongly recommended for proper routing
    // If missing, we'll infer routing for offers (Android -> Web) but warn about it
    if ((type === 'offer' || type === 'answer') && !targetDeviceId) {
      // For offers from Android devices (not web), infer web client as target
      // For answers from web clients, we require targetDeviceId (which should be set by web client)
      if (type === 'offer' && deviceId && !deviceId.startsWith('web_')) {
        // Android device sending offer - find a web client to send to
        // If there's only one web client, route to it; otherwise broadcast with warning
        const webClients = Array.from(this.deviceChannels.entries())
          .filter(([id]) => id.startsWith('web_'));

        if (webClients.length === 0) {
          logger.warn('Android device sent offer but no web clients connected', { deviceId });
          this.sendError(ws, 'No web clients available to receive offer', deviceId || undefined);
          return;
        } else if (webClients.length === 1) {
          // Single web client - route to it
          const [targetId] = webClients[0];
          logger.info('Inferring targetDeviceId for offer', { deviceId, inferredTarget: targetId });
          message.targetDeviceId = targetId; // Update message with inferred target
        } else {
          // Multiple web clients - log warning but broadcast (should be avoided)
          logger.warn('Android device sent offer without targetDeviceId and multiple web clients exist', {
            deviceId,
            webClientsCount: webClients.length
          });
          this.broadcastToAllDevices(message, deviceId);
          return;
        }
      } else if (type === 'answer') {
        // Answers should always have targetDeviceId
        logger.error('WebRTC answer missing targetDeviceId, rejecting', { type, deviceId });
        this.sendError(ws, `targetDeviceId is required for ${type} messages`, deviceId || undefined);
        return;
      }
    }

    // If targetDeviceId is specified (or inferred), route to specific device
    const finalTargetDeviceId = message.targetDeviceId || targetDeviceId;
    if (finalTargetDeviceId) {
      const signalingMessage = {
        type,
        sdp: message.sdp,
        label: message.label,
        id: message.id,
        candidate: message.candidate,
        // sdpMLineIndex: message.sdpMLineIndex ?? message.label,
        // sdpMid: message.sdpMid ?? message.id,
        deviceId,
        timestamp: Date.now()
      };

      if (this.sendToDevice(finalTargetDeviceId, signalingMessage)) {
        logger.debug('WebRTC message sent', { type, targetDeviceId: finalTargetDeviceId });
      } else {
        logger.warn('Failed to send WebRTC message', { type, targetDeviceId: finalTargetDeviceId });
        this.sendError(ws, `Target device ${finalTargetDeviceId} not found`, deviceId || undefined);
      }
    } else {
      // For candidates only: broadcast to all other devices (excluding sender) if no targetDeviceId
      // This provides backward compatibility but is not recommended for offers/answers
      logger.debug('WebRTC candidate broadcasted (no targetDeviceId)', { type, deviceId });
      this.broadcastToAllDevices(message, deviceId);
    }
  }

  /**
   * Handle channel join requests
   */
  private handleChannelJoin(ws: WebSocket, message: Message): void {
    const { deviceId, channel } = message;

    if (!deviceId || !channel) {
      this.sendError(ws, 'Device ID and channel are required');
      return;
    }

    if (this.subscribeToChannel(deviceId, channel)) {
      this.sendSuccess(ws, deviceId, `Joined channel: ${channel}`);
    } else {
      this.sendError(ws, `Failed to join channel: ${channel}`);
    }
  }

  /**
   * Handle channel leave requests
   */
  private handleChannelLeave(ws: WebSocket, message: Message): void {
    const { deviceId, channel } = message;

    if (!deviceId || !channel) {
      this.sendError(ws, 'Device ID and channel are required');
      return;
    }

    if (this.unsubscribeFromChannel(deviceId, channel)) {
      this.sendSuccess(ws, deviceId, `Left channel: ${channel}`);
    } else {
      this.sendError(ws, `Failed to leave channel: ${channel}`);
    }
  }

  /**
   * Handle get connected devices request
   */
  private handleGetConnectedDevices(ws: WebSocket, message: Message): void {
    const { deviceId } = message;

    if (!deviceId) {
      this.sendError(ws, 'Device ID is required');
      return;
    }

    // Get list of connected devices
    const connectedDevices = Array.from(this.deviceChannels.keys()).map(id => {
      const deviceChannel = `device_${id}`;
      const info = this.deviceInfo.get(id);

      return {
        deviceId: id,
        channel: deviceChannel,
        platform: info?.platform || 'unknown',
        connectedAt: info?.timestamp || Date.now(),
        isActive: this.deviceChannels.has(id)
      };
    });

    // Send response
    const messageStr = JSON.stringify({
      type: 'connected_devices',
      deviceId,
      devices: connectedDevices,
      totalCount: connectedDevices.length,
      timestamp: Date.now()
    });

    ws.send(messageStr);

    logger.info('Sent connected devices list', { deviceId, count: connectedDevices.length });
  }

  /**
   * Subscribe device to a channel
   */
  private subscribeToChannel(deviceId: string, channelName: string): boolean {
    if (!this.deviceChannels.has(deviceId)) {
      logger.error('Device not registered', { deviceId });
      return false;
    }

    // Check channel limit
    const deviceChannels = Array.from(this.channelSubscriptions.entries())
      .filter(([_, devices]) => devices.has(deviceId))
      .map(([channel, _]) => channel);

    if (deviceChannels.length >= this.MAX_CHANNELS_PER_DEVICE) {
      logger.error('Device reached channel limit', { deviceId, maxChannels: this.MAX_CHANNELS_PER_DEVICE });
      return false;
    }

    // Add to channel subscription
    if (!this.channelSubscriptions.has(channelName)) {
      this.channelSubscriptions.set(channelName, new Set());
    }
    this.channelSubscriptions.get(channelName)!.add(deviceId);

    logger.info('Device subscribed to channel', { deviceId, channelName });
    return true;
  }

  /**
   * Unsubscribe device from a channel
   */
  private unsubscribeFromChannel(deviceId: string, channelName: string): boolean {
    if (!this.channelSubscriptions.has(channelName)) {
      return false;
    }

    const channelDevices = this.channelSubscriptions.get(channelName)!;
    const removed = channelDevices.delete(deviceId);

    // Clean up empty channels
    if (channelDevices.size === 0) {
      this.channelSubscriptions.delete(channelName);
    }

    logger.info('Device unsubscribed from channel', { deviceId, channelName });
    return removed;
  }

  /**
   * Send message to specific device
   */
  private sendToDevice(deviceId: string, message: any): boolean {
    const ws = this.deviceChannels.get(deviceId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  /**
   * Send message to all devices in a channel
   */
  private sendToChannel(channelName: string, message: any, excludeDeviceId?: string): boolean {
    const channelDevices = this.channelSubscriptions.get(channelName);
    if (!channelDevices) {
      return false;
    }

    let sentCount = 0;
    channelDevices.forEach(deviceId => {
      if (deviceId !== excludeDeviceId) {
        if (this.sendToDevice(deviceId, message)) {
          sentCount++;
        }
      }
    });

    logger.debug('Message sent to channel', { channelName, recipients: sentCount });
    return sentCount > 0;
  }

  /**
   * Broadcast message to all connected clients
   */
  private broadcast(sender: WebSocket, message: string | WebSocket.Data): void {
    let broadcastCount = 0;

    this.wss.clients.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(message);
        broadcastCount++;
      }
    });

    logger.debug('Message broadcasted', {
      recipients: broadcastCount,
      totalClients: this.wss.clients.size
    });
  }

  /**
   * Broadcast message to all devices (excluding specific device)
   */
  private broadcastToAllDevices(message: any, excludeDeviceId?: string): void {
    const messageStr = typeof message === 'string'
      ? message
      : JSON.stringify(message);

    // Get the WebSocket for the excluded device (if any)
    const excludeWs = excludeDeviceId ? this.deviceChannels.get(excludeDeviceId) : undefined;

    let sentCount = 0;
    this.wss.clients.forEach((client) => {
      // Skip the excluded client
      if (client === excludeWs) {
        return;
      }
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
        sentCount++;
      }
    });

    logger.debug('Message sent to all devices', { recipients: sentCount, excludeDeviceId });
  }

  /**
   * Broadcast message to all Android devices (exclude web clients)
   */
  private broadcastToAndroidDevices(message: any, excludeDeviceId?: string): void {
    let sentCount = 0;
    this.deviceChannels.forEach((ws, deviceId) => {
      // Only send to Android devices (not web clients)
      const isAndroidDevice = !deviceId.startsWith('web_');
      const isExcluded = deviceId === excludeDeviceId;

      if (isAndroidDevice && !isExcluded && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
        sentCount++;
      }
    });

    logger.debug('Message sent to Android devices', { recipients: sentCount });
  }

  /**
   * Send success response
   */
  private sendSuccess(ws: WebSocket, deviceId: string, message: string, data: any = null): void {
    const response = {
      type: 'success',
      deviceId,
      status: 'success',
      message,
      data,
      timestamp: Date.now()
    };
    ws.send(JSON.stringify(response));
  }

  /**
   * Send error response
   */
  private sendError(ws: WebSocket, errorMessage: string, deviceId: string | null = null): void {
    const response = {
      type: 'error',
      deviceId,
      status: 'error',
      error: errorMessage,
      timestamp: Date.now()
    };
    ws.send(JSON.stringify(response));
  }

  /**
   * Send server message to device
   */
  private sendServerMessage(deviceId: string, message: any): void {
    const serverMessage = {
      type: 'server_message',
      deviceId,
      ...message,
      timestamp: Date.now()
    };
    this.sendToDevice(deviceId, serverMessage);
  }

  /**
   * Start heartbeat monitoring for device
   */
  private startHeartbeatMonitoring(deviceId: string): void {
    this.resetHeartbeatTimer(deviceId);
  }

  /**
   * Reset heartbeat timer for device
   */
  private resetHeartbeatTimer(deviceId: string): void {
    // Clear existing timer
    if (this.heartbeatTimers.has(deviceId)) {
      clearTimeout(this.heartbeatTimers.get(deviceId)!);
    }

    // Set new timer
    const timer = setTimeout(() => {
      logger.warn('Device heartbeat timeout', { deviceId });
      this.handleDeviceTimeout(deviceId);
    }, this.DEVICE_TIMEOUT);

    this.heartbeatTimers.set(deviceId, timer);
  }

  /**
   * Handle device timeout (no heartbeat)
   */
  private handleDeviceTimeout(deviceId: string): void {
    logger.warn('Removing timed out device', { deviceId });
    this.removeDevice(deviceId);
  }

  /**
   * Handle WebSocket disconnection
   */
  private handleDisconnection(ws: WebSocket): void {
    // Find device by WebSocket connection
    for (const [deviceId, deviceWs] of this.deviceChannels.entries()) {
      if (deviceWs === ws) {
        this.removeDevice(deviceId);
        break;
      }
    }
  }

  /**
   * Remove device and cleanup
   */
  private removeDevice(deviceId: string): void {
    // Remove from device channels
    this.deviceChannels.delete(deviceId);

    // Remove device info
    this.deviceInfo.delete(deviceId);

    // Clear heartbeat timer
    if (this.heartbeatTimers.has(deviceId)) {
      clearTimeout(this.heartbeatTimers.get(deviceId)!);
      this.heartbeatTimers.delete(deviceId);
    }

    // Remove from all channel subscriptions
    this.channelSubscriptions.forEach((devices, channelName) => {
      devices.delete(deviceId);
      if (devices.size === 0) {
        this.channelSubscriptions.delete(channelName);
      }
    });

    logger.info('Device removed', { deviceId, remainingDevices: this.deviceChannels.size });
  }

  /**
   * Send message to specific client (backward compatibility)
   */
  public sendToClient(client: WebSocket, message: any): void {
    if (client.readyState === WebSocket.OPEN) {
      const messageStr = typeof message === 'string'
        ? message
        : JSON.stringify(message);
      client.send(messageStr);
    }
  }

  /**
   * Broadcast to all connected clients (backward compatibility)
   */
  public broadcastToAll(message: any): void {
    const messageStr = typeof message === 'string'
      ? message
      : JSON.stringify(message);

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });

    logger.info('Message sent to all clients', {
      clientsCount: this.wss.clients.size
    });
  }

  /**
   * Setup heartbeat to detect broken connections
   */
  private setupHeartbeat(): void {
    const interval = setInterval(() => {
      this.wss.clients.forEach((ws: any) => {
        if (ws.isAlive === false) {
          logger.warn('Terminating inactive WebSocket connection');
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, this.HEARTBEAT_INTERVAL);

    this.wss.on('close', () => {
      clearInterval(interval);
    });
  }

  /**
   * Get connected clients count
   */
  public getClientsCount(): number {
    return this.wss.clients.size;
  }

  /**
   * Get registered devices count
   */
  public getDevicesCount(): number {
    return this.deviceChannels.size;
  }

  /**
   * Get connected devices list
   */
  public getConnectedDevices(): Array<{ deviceId: string; platform?: string; connectedAt: number }> {
    return Array.from(this.deviceChannels.keys()).map(id => {
      const info = this.deviceInfo.get(id);
      return {
        deviceId: id,
        platform: info?.platform,
        connectedAt: info?.timestamp || Date.now()
      };
    });
  }

  /**
   * Get channel statistics
   */
  public getChannelStats(): { channels: number; devices: number } {
    return {
      channels: this.channelSubscriptions.size,
      devices: this.deviceChannels.size
    };
  }

  /**
   * Close all connections and shutdown
   */
  public async shutdown(): Promise<void> {
    logger.info('Shutting down WebSocket signaling server...');

    // Clear all heartbeat timers
    this.heartbeatTimers.forEach(timer => clearTimeout(timer));
    this.heartbeatTimers.clear();

    // Close all client connections
    this.wss.clients.forEach((client) => {
      client.close(1000, 'Server shutting down');
    });

    // Clean up device tracking
    this.deviceChannels.clear();
    this.channelSubscriptions.clear();
    this.deviceInfo.clear();

    // Close the server
    return new Promise((resolve, reject) => {
      this.wss.close((err) => {
        if (err) {
          logger.error('Error closing WebSocket server', err);
          reject(err);
        } else {
          logger.info('WebSocket signaling server closed');
          resolve();
        }
      });
    });
  }

  /**
   * Get WebSocket server instance
   */
  public getServer(): WebSocket.Server {
    return this.wss;
  }
}

export default SignalingService;

