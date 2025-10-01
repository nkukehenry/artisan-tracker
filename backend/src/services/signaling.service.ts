import { Server as HTTPServer } from 'http';
import WebSocket from 'ws';
import { logger } from '../config/logger';

export class SignalingService {
  private wss: WebSocket.Server;

  constructor(server: HTTPServer) {
    // Create WebSocket server on /signaling path
    this.wss = new WebSocket.Server({ 
      server,
      path: '/signaling'
    });

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

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to signaling server',
        clientsCount: this.wss.clients.size
      }));

      // Handle incoming messages
      ws.on('message', (message: WebSocket.Data) => {
        try {
          const messageStr = message.toString();
          logger.debug('Received WebSocket message', { 
            clientIp,
            messageLength: messageStr.length
          });

          // Relay message to all other clients
          this.broadcast(ws, message);
        } catch (error) {
          logger.error('Error handling WebSocket message', { error, clientIp });
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        logger.info('WebSocket client disconnected', { 
          clientIp,
          remainingClients: this.wss.clients.size
        });
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error('WebSocket error', { error, clientIp });
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

  /**
   * Broadcast message to all clients except sender
   */
  private broadcast(sender: WebSocket, message: WebSocket.Data): void {
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
   * Send message to specific client
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
   * Broadcast to all connected clients
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
    }, 30000); // 30 seconds

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
   * Close all connections and shutdown
   */
  public async shutdown(): Promise<void> {
    logger.info('Shutting down WebSocket signaling server...');

    // Close all client connections
    this.wss.clients.forEach((client) => {
      client.close(1000, 'Server shutting down');
    });

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

