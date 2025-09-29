import admin from 'firebase-admin';
import { logger } from './logger';

class FirebaseService {
  private static instance: FirebaseService;
  private app: admin.app.App | null = null;

  private constructor() {
    this.initializeFirebase();
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  private initializeFirebase(): void {
    try {
      // Check if Firebase is already initialized
      if (admin.apps.length === 0) {
        const serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        };

        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });

        logger.info('Firebase Admin SDK initialized successfully');
      } else {
        this.app = admin.app();
        logger.info('Firebase Admin SDK already initialized');
      }
    } catch (error) {
      logger.error('Failed to initialize Firebase Admin SDK', error);
      throw error;
    }
  }

  public getApp(): admin.app.App {
    if (!this.app) {
      throw new Error('Firebase not initialized');
    }
    return this.app;
  }

  public getMessaging(): admin.messaging.Messaging {
    return admin.messaging();
  }

  public getFirestore(): admin.firestore.Firestore {
    return admin.firestore();
  }

  // Send command to device via Firebase Cloud Messaging
  public async sendDeviceCommand(
    deviceToken: string,
    command: string,
    payload?: any
  ): Promise<string> {
    try {
      const message: admin.messaging.Message = {
        token: deviceToken,
        data: {
          command,
          payload: payload ? JSON.stringify(payload) : '',
          timestamp: new Date().toISOString(),
        },
        android: {
          priority: 'high',
          ttl: 3600000, // 1 hour
        },
        apns: {
          payload: {
            aps: {
              contentAvailable: true,
              priority: 10,
            },
          },
        },
      };

      const response = await this.getMessaging().send(message);
      logger.info('Device command sent successfully', {
        deviceToken,
        command,
        messageId: response,
      });

      return response;
    } catch (error) {
      logger.error('Failed to send device command', {
        deviceToken,
        command,
        error,
      });
      throw error;
    }
  }

  // Send notification to device
  public async sendNotification(
    deviceToken: string,
    title: string,
    body: string,
    data?: any
  ): Promise<string> {
    try {
      const message: admin.messaging.Message = {
        token: deviceToken,
        notification: {
          title,
          body,
        },
        data: data ? {
          ...Object.keys(data).reduce((acc, key) => {
            acc[key] = String(data[key]);
            return acc;
          }, {} as Record<string, string>),
        } : undefined,
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title,
                body,
              },
              sound: 'default',
            },
          },
        },
      };

      const response = await this.getMessaging().send(message);
      logger.info('Notification sent successfully', {
        deviceToken,
        title,
        messageId: response,
      });

      return response;
    } catch (error) {
      logger.error('Failed to send notification', {
        deviceToken,
        title,
        error,
      });
      throw error;
    }
  }

  // Send multicast message to multiple devices
  public async sendMulticastMessage(
    deviceTokens: string[],
    command: string,
    payload?: any
  ): Promise<any> {
    try {
      const message: admin.messaging.MulticastMessage = {
        tokens: deviceTokens,
        data: {
          command,
          payload: payload ? JSON.stringify(payload) : '',
          timestamp: new Date().toISOString(),
        },
        android: {
          priority: 'high',
          ttl: 3600000, // 1 hour
        },
        apns: {
          payload: {
            aps: {
              contentAvailable: true,
              priority: 10,
            },
          },
        },
      };

      const response = await this.getMessaging().sendEachForMulticast(message);
      logger.info('Multicast message sent', {
        deviceCount: deviceTokens.length,
        command,
        successCount: response.successCount,
        failureCount: response.failureCount,
      });

      return response;
    } catch (error) {
      logger.error('Failed to send multicast message', {
        deviceCount: deviceTokens.length,
        command,
        error,
      });
      throw error;
    }
  }

  // Store device command in Firestore for persistence
  public async storeDeviceCommand(
    deviceId: string,
    command: string,
    payload?: any,
    status: string = 'pending'
  ): Promise<void> {
    try {
      const commandData = {
        deviceId,
        command,
        payload: payload || {},
        status,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await this.getFirestore()
        .collection('device_commands')
        .add(commandData);

      logger.info('Device command stored in Firestore', {
        deviceId,
        command,
        status,
      });
    } catch (error) {
      logger.error('Failed to store device command in Firestore', {
        deviceId,
        command,
        error,
      });
      throw error;
    }
  }

  // Get device commands from Firestore
  public async getDeviceCommands(
    deviceId: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      const snapshot = await this.getFirestore()
        .collection('device_commands')
        .where('deviceId', '==', deviceId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const commands = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return commands;
    } catch (error) {
      logger.error('Failed to get device commands from Firestore', {
        deviceId,
        error,
      });
      throw error;
    }
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      // Try to get a reference to Firestore
      await this.getFirestore().collection('health_check').limit(1).get();
      return true;
    } catch (error) {
      logger.error('Firebase health check failed', error);
      return false;
    }
  }
}

export const firebase = FirebaseService.getInstance();
export default firebase;
