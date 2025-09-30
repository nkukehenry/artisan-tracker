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
        // Check if Firebase credentials are provided
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
          logger.warn('Firebase credentials not provided. Firebase features will be disabled.');
          return;
        }

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
      // Don't throw error, just log it and continue without Firebase
      logger.warn('Continuing without Firebase features');
    }
  }

  public getApp(): admin.app.App | null {
    return this.app;
  }

  public getMessaging(): admin.messaging.Messaging | null {
    if (!this.app) {
      logger.warn('Firebase not initialized. Messaging features disabled.');
      return null;
    }
    return admin.messaging();
  }

  public getFirestore(): admin.firestore.Firestore | null {
    if (!this.app) {
      logger.warn('Firebase not initialized. Firestore features disabled.');
      return null;
    }
    return admin.firestore();
  }

  // Send command to device via Firebase Cloud Messaging
  public async sendDeviceCommand(
    deviceToken: string,
    command: string,
    payload?: any
  ): Promise<string> {
    if (!this.app) {
      throw new Error('Firebase not initialized. Cannot send device command.');
    }
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

      const messaging = this.getMessaging();
      if (!messaging) {
        throw new Error('Firebase messaging not available');
      }
      const response = await messaging.send(message);
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
    if (!this.app) {
      throw new Error('Firebase not initialized. Cannot send notification.');
    }
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

      const messaging = this.getMessaging();
      if (!messaging) {
        throw new Error('Firebase messaging not available');
      }
      const response = await messaging.send(message);
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

      const messaging = this.getMessaging();
      if (!messaging) {
        throw new Error('Firebase messaging not available');
      }
      const response = await messaging.sendEachForMulticast(message);
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

      const firestore = this.getFirestore();
      if (!firestore) {
        throw new Error('Firebase Firestore not available');
      }
      await firestore
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
      const firestore = this.getFirestore();
      if (!firestore) {
        throw new Error('Firebase Firestore not available');
      }
      const snapshot = await firestore
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
      const firestore = this.getFirestore();
      if (!firestore) {
        logger.warn('Firebase not initialized - health check failed');
        return false;
      }
      await firestore.collection('health_check').limit(1).get();
      return true;
    } catch (error) {
      logger.error('Firebase health check failed', error);
      return false;
    }
  }
}

export const firebase = FirebaseService.getInstance();
export default firebase;
