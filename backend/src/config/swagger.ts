import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Artisan Tracker API',
    version: '1.0.0',
    description: 'A comprehensive mobile device tracking and management API for SaaS platforms',
    contact: {
      name: 'API Support',
      email: 'support@mobiletracker.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:83/api',
      description: 'Development server',
    },
    {
      url: 'https://tracker.mutindo.com/api',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from login endpoint',
      },
    },
    schemas: {
      // Common schemas
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Error message',
          },
          error: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                example: 'VALIDATION_ERROR',
              },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                },
              },
            },
          },
        },
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Operation successful',
          },
          data: {
            type: 'object',
          },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          total: {
            type: 'integer',
            example: 100,
          },
          page: {
            type: 'integer',
            example: 1,
          },
          limit: {
            type: 'integer',
            example: 10,
          },
          totalPages: {
            type: 'integer',
            example: 10,
          },
        },
      },

      // Auth schemas
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            minLength: 8,
            example: 'SecurePass123!',
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName', 'tenantName'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            minLength: 8,
            example: 'SecurePass123!',
          },
          firstName: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            example: 'John',
          },
          lastName: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            example: 'Doe',
          },
          tenantName: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            example: 'Acme Corporation',
          },
          tenantDomain: {
            type: 'string',
            format: 'uri',
            example: 'https://acme.com',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Login successful',
          },
          data: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'user@example.com',
                  },
                  firstName: {
                    type: 'string',
                    example: 'John',
                  },
                  lastName: {
                    type: 'string',
                    example: 'Doe',
                  },
                  role: {
                    type: 'string',
                    enum: ['SUPER_ADMIN', 'TENANT_ADMIN', 'USER'],
                    example: 'USER',
                  },
                  tenantId: {
                    type: 'string',
                    format: 'uuid',
                    example: '123e4567-e89b-12d3-a456-426614174001',
                  },
                },
              },
              tokens: {
                type: 'object',
                properties: {
                  accessToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  },
                  refreshToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  },
                },
              },
            },
          },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },

      // Device schemas
      Device: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          deviceId: {
            type: 'string',
            example: 'DEVICE-001',
          },
          name: {
            type: 'string',
            example: 'John\'s iPhone',
          },
          model: {
            type: 'string',
            example: 'iPhone 13 Pro',
          },
          osVersion: {
            type: 'string',
            example: 'iOS 15.0',
          },
          appVersion: {
            type: 'string',
            example: '1.0.0',
          },
          isOnline: {
            type: 'boolean',
            example: true,
          },
          lastSeenAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
          batteryLevel: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
            example: 85,
          },
          location: {
            type: 'object',
            properties: {
              latitude: {
                type: 'number',
                example: 40.7128,
              },
              longitude: {
                type: 'number',
                example: -74.0060,
              },
              accuracy: {
                type: 'number',
                example: 10.5,
              },
            },
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
        },
      },
      RegisterDeviceRequest: {
        type: 'object',
        required: ['deviceId', 'name'],
        properties: {
          deviceId: {
            type: 'string',
            minLength: 3,
            maxLength: 50,
            example: 'DEVICE-001',
          },
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            example: 'John\'s iPhone',
          },
          model: {
            type: 'string',
            maxLength: 100,
            example: 'iPhone 13 Pro',
          },
          osVersion: {
            type: 'string',
            maxLength: 50,
            example: 'iOS 15.0',
          },
          appVersion: {
            type: 'string',
            maxLength: 20,
            example: '1.0.0',
          },
          // Device Hardware Information
          brand: {
            type: 'string',
            maxLength: 50,
            example: 'Samsung',
          },
          manufacturer: {
            type: 'string',
            maxLength: 100,
            example: 'Samsung Electronics',
          },
          deviceName: {
            type: 'string',
            maxLength: 100,
            example: 'o1q',
          },
          product: {
            type: 'string',
            maxLength: 100,
            example: 'o1quew',
          },
          board: {
            type: 'string',
            maxLength: 100,
            example: 'exynos2100',
          },
          hardware: {
            type: 'string',
            maxLength: 100,
            example: 'exynos2100',
          },
          // Android System Information
          sdkVersion: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            example: 34,
          },
          androidVersion: {
            type: 'string',
            maxLength: 20,
            example: '14',
          },
          release: {
            type: 'string',
            maxLength: 20,
            example: '14',
          },
          codename: {
            type: 'string',
            maxLength: 50,
            example: 'UpsideDownCake',
          },
          incremental: {
            type: 'string',
            maxLength: 50,
            example: '123456789',
          },
          securityPatch: {
            type: 'string',
            maxLength: 20,
            example: '2025-09-01',
          },
          // Memory and Storage
          totalMemoryGB: {
            type: 'number',
            minimum: 0,
            example: 8.0,
          },
          freeMemoryGB: {
            type: 'number',
            minimum: 0,
            example: 3.2,
          },
          totalStorageGB: {
            type: 'number',
            minimum: 0,
            example: 256.0,
          },
          freeStorageGB: {
            type: 'number',
            minimum: 0,
            example: 128.5,
          },
          usedMemoryPercentage: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
            example: 60,
          },
          // Device State
          orientation: {
            type: 'string',
            enum: ['portrait', 'landscape'],
            example: 'portrait',
          },
          isRooted: {
            type: 'boolean',
            example: false,
          },
          isEmulator: {
            type: 'boolean',
            example: false,
          },
          screenDensity: {
            type: 'number',
            minimum: 0,
            example: 3.0,
          },
          screenResolution: {
            type: 'string',
            pattern: '^\\d+x\\d+$',
            example: '1080x2400',
          },
          // Network Information
          networkOperator: {
            type: 'string',
            maxLength: 100,
            example: 'MTN',
          },
          simOperator: {
            type: 'string',
            maxLength: 100,
            example: 'MTN UG',
          },
          simCountryISO: {
            type: 'string',
            minLength: 2,
            maxLength: 3,
            example: 'UG',
          },
          // App Information
          appVersionCode: {
            type: 'integer',
            minimum: 1,
            example: 105,
          },
          appInstallTime: {
            type: 'integer',
            minimum: 0,
            example: 1696320000000,
          },
          // Data Collection
          collectedAt: {
            type: 'integer',
            minimum: 0,
            example: 1696351200000,
          },
        },
      },
      CallHomeRequest: {
        type: 'object',
        required: ['deviceId', 'batteryLevel', 'location'],
        properties: {
          deviceId: {
            type: 'string',
            minLength: 3,
            maxLength: 50,
            example: '1234567890',
          },
          batteryLevel: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
            example: 50,
          },
          location: {
            type: 'object',
            required: ['latitude', 'longitude'],
            properties: {
              latitude: {
                type: 'number',
                minimum: -90,
                maximum: 90,
                example: 40.7128,
              },
              longitude: {
                type: 'number',
                minimum: -180,
                maximum: 180,
                example: -74.006,
              },
              accuracy: {
                type: 'number',
                minimum: 0,
                example: 10,
              },
              address: {
                type: 'string',
                maxLength: 255,
                example: 'New York, NY, USA',
              },
            },
          },
          // Optional network information
          networkOperator: {
            type: 'string',
            maxLength: 100,
            example: 'MTN',
          },
          simOperator: {
            type: 'string',
            maxLength: 100,
            example: 'MTN UG',
          },
          simCountryISO: {
            type: 'string',
            minLength: 2,
            maxLength: 3,
            example: 'UG',
          },
          // Optional memory and storage
          totalMemoryGB: {
            type: 'number',
            minimum: 0,
            example: 8.0,
          },
          freeMemoryGB: {
            type: 'number',
            minimum: 0,
            example: 3.2,
          },
          totalStorageGB: {
            type: 'number',
            minimum: 0,
            example: 256.0,
          },
          freeStorageGB: {
            type: 'number',
            minimum: 0,
            example: 128.5,
          },
          usedMemoryPercentage: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
            example: 60,
          },
          // Optional device state
          orientation: {
            type: 'string',
            enum: ['portrait', 'landscape'],
            example: 'portrait',
          },
          isRooted: {
            type: 'boolean',
            example: false,
          },
          // Additional device attributes
          brand: {
            type: 'string',
            maxLength: 50,
            example: 'Samsung',
          },
          manufacturer: {
            type: 'string',
            maxLength: 100,
            example: 'Samsung Electronics',
          },
          deviceName: {
            type: 'string',
            maxLength: 100,
            example: 'o1q',
          },
          product: {
            type: 'string',
            maxLength: 100,
            example: 'o1quew',
          },
          board: {
            type: 'string',
            maxLength: 100,
            example: 'exynos2100',
          },
          hardware: {
            type: 'string',
            maxLength: 100,
            example: 'exynos2100',
          },
          // Android System Information
          sdkVersion: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            example: 34,
          },
          androidVersion: {
            type: 'string',
            maxLength: 20,
            example: '14',
          },
          release: {
            type: 'string',
            maxLength: 20,
            example: '14',
          },
          codename: {
            type: 'string',
            maxLength: 50,
            example: 'UpsideDownCake',
          },
          incremental: {
            type: 'string',
            maxLength: 50,
            example: '123456789',
          },
          securityPatch: {
            type: 'string',
            maxLength: 20,
            example: '2025-09-01',
          },
          // Additional device state
          isEmulator: {
            type: 'boolean',
            example: false,
          },
          screenDensity: {
            type: 'number',
            minimum: 0,
            example: 3.0,
          },
          screenResolution: {
            type: 'string',
            pattern: '^\\d+x\\d+$',
            example: '1080x2400',
          },
          // App Information
          appVersionCode: {
            type: 'integer',
            minimum: 1,
            example: 105,
          },
          appInstallTime: {
            type: 'integer',
            minimum: 0,
            example: 1696320000000,
          },
          // Data Collection
          collectedAt: {
            type: 'integer',
            minimum: 0,
            example: 1696351200000,
          },
        },
      },
      UpdateDeviceRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            example: 'John\'s iPhone',
          },
          model: {
            type: 'string',
            maxLength: 100,
            example: 'iPhone 13 Pro',
          },
          osVersion: {
            type: 'string',
            maxLength: 50,
            example: 'iOS 15.0',
          },
          appVersion: {
            type: 'string',
            maxLength: 20,
            example: '1.0.0',
          },
        },
      },
      SendCommandRequest: {
        type: 'object',
        required: ['command'],
        properties: {
          command: {
            type: 'string',
            enum: [
              'RECORD_AUDIO',
              'RECORD_VIDEO',
              'SCREEN_RECORDING',
              'TAKE_PHOTO',
              'GET_LOCATION',
              'GET_CONTACTS',
              'GET_CALL_LOGS',
              'GET_MESSAGES',
              'ENABLE_APP',
              'DISABLE_APP',
              'RESTART_DEVICE',
              'WIPE_DATA',
            ],
            example: 'GET_LOCATION',
          },
          payload: {
            type: 'object',
            example: {
              accuracy: 'high',
              timeout: 30000,
            },
          },
        },
      },
      DeviceCommand: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          command: {
            type: 'string',
            enum: [
              'RECORD_AUDIO',
              'RECORD_VIDEO',
              'SCREEN_RECORDING',
              'TAKE_PHOTO',
              'GET_LOCATION',
              'GET_CONTACTS',
              'GET_CALL_LOGS',
              'GET_MESSAGES',
              'ENABLE_APP',
              'DISABLE_APP',
              'RESTART_DEVICE',
              'WIPE_DATA',
            ],
            example: 'GET_LOCATION',
          },
          payload: {
            type: 'object',
            example: {
              accuracy: 'high',
            },
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'SENT', 'EXECUTED', 'FAILED', 'CANCELLED'],
            example: 'PENDING',
          },
          sentAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
          executedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
          response: {
            type: 'object',
            example: {
              success: true,
              data: 'Command executed successfully',
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
        },
      },
      UpdateDeviceStatusRequest: {
        type: 'object',
        required: ['isOnline'],
        properties: {
          isOnline: {
            type: 'boolean',
            example: true,
          },
          batteryLevel: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
            example: 85,
          },
          location: {
            type: 'object',
            properties: {
              latitude: {
                type: 'number',
                example: 40.7128,
              },
              longitude: {
                type: 'number',
                example: -74.0060,
              },
              accuracy: {
                type: 'number',
                example: 10.5,
              },
            },
          },
        },
      },

      // Media schemas
      MediaFile: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          callId: {
            type: 'string',
            description: 'Optional reference to associated call log',
            example: '123e4567-e89b-12d3-a456-426614174001',
          },
          fileName: {
            type: 'string',
            example: 'photo_20230101_120000.jpg',
          },
          filePath: {
            type: 'string',
            example: '/uploads/photo/photo_20230101_120000.jpg',
          },
          fileSize: {
            type: 'integer',
            example: 1024000,
          },
          mimeType: {
            type: 'string',
            example: 'image/jpeg',
          },
          fileType: {
            type: 'string',
            enum: ['PHOTO', 'VIDEO', 'AUDIO', 'SCREEN_RECORDING', 'DOCUMENT', 'OTHER'],
            example: 'PHOTO',
          },
          metadata: {
            type: 'object',
            example: {
              originalName: 'photo.jpg',
              uploadedAt: '2023-01-01T12:00:00Z',
              uploadedBy: '123e4567-e89b-12d3-a456-426614174000',
            },
          },
          isEncrypted: {
            type: 'boolean',
            example: false,
          },
          location: {
            type: 'string',
            description: 'Location where media was captured',
            example: 'New York, NY, USA',
          },
          gpsCoordinates: {
            type: 'string',
            description: 'GPS coordinates as JSON string',
            example: '{"latitude": 40.7128, "longitude": -74.0060, "accuracy": 10}',
          },
          call: {
            type: 'object',
            description: 'Associated call log (if available)',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                example: '123e4567-e89b-12d3-a456-426614174001',
              },
              phoneNumber: {
                type: 'string',
                example: '+1234567890',
              },
              contactName: {
                type: 'string',
                example: 'John Doe',
              },
              callType: {
                type: 'string',
                enum: ['INCOMING', 'OUTGOING', 'MISSED', 'REJECTED'],
                example: 'INCOMING',
              },
              duration: {
                type: 'integer',
                example: 120,
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                example: '2023-01-01T12:00:00Z',
              },
              location: {
                type: 'string',
                example: 'New York, NY, USA',
              },
              gpsCoordinates: {
                type: 'string',
                example: '{"latitude": 40.7128, "longitude": -74.0060}',
              },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
        },
      },
      UploadMediaRequest: {
        type: 'object',
        required: ['deviceId', 'fileType'],
        properties: {
          deviceId: {
            type: 'string',
            minLength: 3,
            maxLength: 50,
            example: 'DEVICE-001',
          },
          fileType: {
            type: 'string',
            enum: ['PHOTO', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER'],
            example: 'PHOTO',
          },
          callId: {
            type: 'string',
            description: 'Optional reference to associated call log',
            example: '123e4567-e89b-12d3-a456-426614174001',
          },
          location: {
            type: 'string',
            description: 'Location where media was captured',
            example: 'New York, NY, USA',
          },
          gpsCoordinates: {
            type: 'string',
            description: 'GPS coordinates as JSON string',
            example: '{"latitude": 40.7128, "longitude": -74.0060, "accuracy": 10}',
          },
          file: {
            type: 'string',
            format: 'binary',
            description: 'File to upload',
          },
        },
      },

      // Data schemas
      CallLog: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          mediaId: {
            type: 'string',
            description: 'Optional reference to associated media file',
            example: '123e4567-e89b-12d3-a456-426614174001',
          },
          deviceId: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          phoneNumber: {
            type: 'string',
            example: '1234567890',
          },
          contactName: {
            type: 'string',
            example: 'John Doe',
          },
          callType: {
            type: 'string',
            enum: ['INCOMING', 'OUTGOING', 'MISSED', 'REJECTED'],
            example: 'OUTGOING',
          },
          duration: {
            type: 'integer',
            minimum: 0,
            example: 120,
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
          isIncoming: {
            type: 'boolean',
            example: false,
          },
          location: {
            type: 'string',
            description: 'Location where call was made',
            example: 'New York, NY, USA',
          },
          gpsCoordinates: {
            type: 'string',
            description: 'GPS coordinates as JSON string',
            example: '{"latitude": 40.7128, "longitude": -74.0060, "accuracy": 10}',
          },
          media: {
            type: 'object',
            description: 'Associated media file (if available)',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                example: '123e4567-e89b-12d3-a456-426614174001',
              },
              fileName: {
                type: 'string',
                example: 'call_recording.mp3',
              },
              filePath: {
                type: 'string',
                example: '/uploads/audio/call_recording.mp3',
              },
              fileSize: {
                type: 'integer',
                example: 1024000,
              },
              mimeType: {
                type: 'string',
                example: 'audio/mpeg',
              },
              fileType: {
                type: 'string',
                enum: ['PHOTO', 'VIDEO', 'AUDIO', 'SCREEN_RECORDING'],
                example: 'AUDIO',
              },
              location: {
                type: 'string',
                example: 'New York, NY, USA',
              },
              gpsCoordinates: {
                type: 'string',
                example: '{"latitude": 40.7128, "longitude": -74.0060}',
              },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
        },
      },
      CreateCallLogRequest: {
        type: 'object',
        required: ['deviceId', 'phoneNumber', 'callType', 'timestamp'],
        properties: {
          deviceId: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
            example: 'DEVICE-001',
          },
          mediaId: {
            type: 'string',
            description: 'Optional reference to associated media file',
            example: '123e4567-e89b-12d3-a456-426614174001',
          },
          phoneNumber: {
            type: 'string',
            minLength: 1,
            maxLength: 20,
            example: '1234567890',
          },
          contactName: {
            type: 'string',
            maxLength: 100,
            example: 'John Doe',
          },
          callType: {
            type: 'string',
            enum: ['INCOMING', 'OUTGOING', 'MISSED', 'REJECTED'],
            example: 'OUTGOING',
          },
          duration: {
            type: 'integer',
            minimum: 0,
            example: 120,
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
          location: {
            type: 'string',
            description: 'Location where call was made',
            example: 'New York, NY, USA',
          },
          gpsCoordinates: {
            type: 'string',
            description: 'GPS coordinates as JSON string',
            example: '{"latitude": 40.7128, "longitude": -74.0060, "accuracy": 10}',
          },
        },
      },
      Contact: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          deviceId: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          name: {
            type: 'string',
            example: 'John Doe',
          },
          phoneNumber: {
            type: 'string',
            example: '1234567890',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          avatar: {
            type: 'string',
            example: 'https://example.com/avatar.jpg',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
        },
      },
      CreateContactRequest: {
        type: 'object',
        required: ['deviceId', 'name'],
        properties: {
          deviceId: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
            example: 'DEVICE-001',
          },
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            example: 'John Doe',
          },
          phoneNumber: {
            type: 'string',
            maxLength: 20,
            example: '1234567890',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          avatar: {
            type: 'string',
            example: 'https://example.com/avatar.jpg',
          },
        },
      },
      Message: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          deviceId: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          messageType: {
            type: 'string',
            enum: ['SMS', 'WHATSAPP', 'TELEGRAM', 'FACEBOOK', 'INSTAGRAM', 'TWITTER', 'EMAIL', 'OTHER'],
            example: 'SMS',
          },
          // platform removed - not in Prisma schema
          sender: {
            type: 'string',
            example: '1234567890',
          },
          recipient: {
            type: 'string',
            example: '0987654321',
          },
          content: {
            type: 'string',
            example: 'Hello World',
          },
          // direction removed - not in Prisma schema
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
          isRead: {
            type: 'boolean',
            example: false,
          },
          metadata: {
            type: 'object',
            example: {},
          },
          location: {
            type: 'string',
            description: 'Location where message was sent',
            example: 'New York, NY, USA',
          },
          gpsCoordinates: {
            type: 'string',
            description: 'GPS coordinates as JSON string',
            example: '{"latitude": 40.7128, "longitude": -74.0060, "accuracy": 10}',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
        },
      },
      CreateMessageRequest: {
        type: 'object',
        required: ['deviceId', 'messageType', 'content', 'timestamp'],
        properties: {
          deviceId: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
            example: 'DEVICE-001',
          },
          messageType: {
            type: 'string',
            enum: ['SMS', 'WHATSAPP', 'TELEGRAM', 'FACEBOOK', 'INSTAGRAM', 'TWITTER', 'EMAIL', 'OTHER'],
            example: 'SMS',
          },
          // platform removed - not in Prisma schema
          sender: {
            type: 'string',
            example: '1234567890',
          },
          recipient: {
            type: 'string',
            example: '0987654321',
          },
          content: {
            type: 'string',
            example: 'Hello World',
          },
          // direction removed - not in Prisma schema
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
          isRead: {
            type: 'boolean',
            example: false,
          },
          metadata: {
            type: 'object',
            example: {},
          },
          location: {
            type: 'string',
            description: 'Location where message was sent',
            example: 'New York, NY, USA',
          },
          gpsCoordinates: {
            type: 'string',
            description: 'GPS coordinates as JSON string',
            example: '{"latitude": 40.7128, "longitude": -74.0060, "accuracy": 10}',
          },
        },
      },
      Location: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          deviceId: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          latitude: {
            type: 'number',
            example: 40.7128,
          },
          longitude: {
            type: 'number',
            example: -74.0060,
          },
          accuracy: {
            type: 'number',
            example: 10.5,
          },
          altitude: {
            type: 'number',
            example: 100.0,
          },
          speed: {
            type: 'number',
            example: 5.2,
          },
          heading: {
            type: 'number',
            example: 45.0,
          },
          address: {
            type: 'string',
            example: '123 Main St, New York, NY 10001',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
        },
      },
      CreateLocationRequest: {
        type: 'object',
        required: ['deviceId', 'latitude', 'longitude', 'timestamp'],
        properties: {
          deviceId: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
            example: 'DEVICE-001',
          },
          latitude: {
            type: 'number',
            example: 40.7128,
          },
          longitude: {
            type: 'number',
            example: -74.0060,
          },
          accuracy: {
            type: 'number',
            example: 10.5,
          },
          altitude: {
            type: 'number',
            example: 100.0,
          },
          speed: {
            type: 'number',
            example: 5.2,
          },
          heading: {
            type: 'number',
            example: 45.0,
          },
          address: {
            type: 'string',
            example: '123 Main St, New York, NY 10001',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
        },
      },
      AppActivity: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          deviceId: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          appName: {
            type: 'string',
            example: 'WhatsApp',
          },
          packageName: {
            type: 'string',
            example: 'com.whatsapp',
          },
          activityType: {
            type: 'string',
            enum: ['OPENED', 'CLOSED', 'INSTALLED', 'UNINSTALLED', 'UPDATED', 'PERMISSION_GRANTED', 'PERMISSION_DENIED'],
            example: 'OPENED',
          },
          duration: {
            type: 'integer',
            minimum: 0,
            example: 120,
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
          metadata: {
            type: 'object',
            example: {},
          },
          isEncrypted: {
            type: 'boolean',
            example: false,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
        },
      },
      CreateAppActivityRequest: {
        type: 'object',
        required: ['deviceId', 'appName', 'packageName', 'activityType', 'timestamp'],
        properties: {
          deviceId: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
            example: 'DEVICE-001',
          },
          appName: {
            type: 'string',
            example: 'WhatsApp',
          },
          packageName: {
            type: 'string',
            example: 'com.whatsapp',
          },
          activityType: {
            type: 'string',
            enum: ['OPENED', 'CLOSED', 'INSTALLED', 'UNINSTALLED', 'UPDATED', 'PERMISSION_GRANTED', 'PERMISSION_DENIED'],
            example: 'OPENED',
          },
          duration: {
            type: 'integer',
            minimum: 0,
            example: 120,
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
          metadata: {
            type: 'object',
            example: {},
          },
        },
      },

      // Telemetry schemas
      Telemetry: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          deviceId: {
            type: 'string',
            example: 'DEVICE-001',
            description: 'Device identifier',
          },
          orientation: {
            type: 'string',
            example: 'portrait',
          },
          isRooted: {
            type: 'boolean',
            example: false,
          },
          isEmulator: {
            type: 'boolean',
            example: false,
          },
          screenDensity: {
            type: 'number',
            example: 3.0,
          },
          screenResolution: {
            type: 'string',
            example: '1080x2400',
          },
          totalMemory: {
            type: 'number',
            example: 8.0,
          },
          freeMemory: {
            type: 'number',
            example: 3.2,
          },
          totalStorage: {
            type: 'number',
            example: 256.0,
          },
          freeStorage: {
            type: 'number',
            example: 128.5,
          },
          usedMemoryPercentage: {
            type: 'integer',
            example: 60,
          },
          brand: {
            type: 'string',
            example: 'Samsung',
          },
          manufacturer: {
            type: 'string',
            example: 'Samsung Electronics',
          },
          model: {
            type: 'string',
            example: 'SM-G991B',
          },
          deviceName: {
            type: 'string',
            example: 'o1q',
          },
          product: {
            type: 'string',
            example: 'o1quew',
          },
          board: {
            type: 'string',
            example: 'exynos2100',
          },
          hardware: {
            type: 'string',
            example: 'exynos2100',
          },
          sdkVersion: {
            type: 'integer',
            example: 34,
          },
          androidVersion: {
            type: 'string',
            example: '14',
          },
          osVersion: {
            type: 'string',
            example: '14',
          },
          codename: {
            type: 'string',
            example: 'UpsideDownCake',
          },
          incremental: {
            type: 'string',
            example: '123456789',
          },
          securityPatch: {
            type: 'string',
            example: '2024-09-01',
          },
          batteryPercentage: {
            type: 'string',
            example: '85',
          },
          batteryTemperature: {
            type: 'string',
            example: '28.5',
          },
          batteryVoltage: {
            type: 'string',
            example: '4.2',
          },
          batteryCurrent: {
            type: 'string',
            example: '500',
          },
          batteryCapacity: {
            type: 'string',
            example: '4500',
          },
          batteryStatus: {
            type: 'string',
            example: 'Charging',
          },
          chargeCounter: {
            type: 'string',
            example: '3825',
          },
          energyCounter: {
            type: 'string',
            example: '16065000',
          },
          appVersion: {
            type: 'string',
            example: '1.0.5',
          },
          appVersionCode: {
            type: 'integer',
            example: 105,
          },
          appInstallTime: {
            type: 'integer',
            example: 1696320000000,
          },
          networkOperator: {
            type: 'string',
            example: 'MTN',
          },
          simOperator: {
            type: 'string',
            example: 'MTN UG',
          },
          simCountryISO: {
            type: 'string',
            example: 'UG',
          },
          latitude: {
            type: 'number',
            example: 40.7128,
          },
          longitude: {
            type: 'number',
            example: -74.0060,
          },
          accuracy: {
            type: 'number',
            example: 10.5,
          },
          altitude: {
            type: 'number',
            example: 100.0,
          },
          speed: {
            type: 'number',
            example: 5.2,
          },
          heading: {
            type: 'number',
            example: 45.0,
          },
          address: {
            type: 'string',
            example: 'New York, NY, USA',
          },
          collectedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00.000Z',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:05.000Z',
          },
        },
      },
      CreateTelemetryRequest: {
        type: 'object',
        required: ['deviceId', 'collectedAt'],
        properties: {
          deviceId: {
            type: 'string',
            example: 'DEVICE-001',
            description: 'Device identifier',
          },
          deviceInfo: {
            type: 'object',
            properties: {
              orientation: { type: 'string', example: 'portrait' },
              isRooted: { type: 'boolean', example: false },
              isEmulator: { type: 'boolean', example: false },
              screenDensity: { type: 'number', example: 3.0 },
              screenResolution: { type: 'string', example: '1080x2400' },
            },
          },
          memoryInfo: {
            type: 'object',
            properties: {
              totalMemory: { type: 'number', example: 8.0 },
              freeMemory: { type: 'number', example: 3.2 },
              totalStorage: { type: 'number', example: 256.0 },
              freeStorage: { type: 'number', example: 128.5 },
              usedMemoryPercentage: { type: 'integer', example: 60 },
            },
          },
          systemInfo: {
            type: 'object',
            properties: {
              brand: { type: 'string', example: 'Samsung' },
              manufacturer: { type: 'string', example: 'Samsung Electronics' },
              model: { type: 'string', example: 'SM-G991B' },
              device: { type: 'string', example: 'o1q' },
              product: { type: 'string', example: 'o1quew' },
              board: { type: 'string', example: 'exynos2100' },
              hardware: { type: 'string', example: 'exynos2100' },
            },
          },
          osInfo: {
            type: 'object',
            properties: {
              sdkVersion: { type: 'integer', example: 34 },
              androidVersion: { type: 'string', example: '14' },
              version: { type: 'string', example: '14' },
              codename: { type: 'string', example: 'UpsideDownCake' },
              incremental: { type: 'string', example: '123456789' },
              securityPatch: { type: 'string', example: '2024-09-01' },
            },
          },
          batteryInfo: {
            type: 'object',
            properties: {
              percentage: { type: 'string', example: '85' },
              temperature: { type: 'string', example: '28.5' },
              voltage: { type: 'string', example: '4.2' },
              current: { type: 'string', example: '500' },
              capacity: { type: 'string', example: '4500' },
              batteryStatus: { type: 'string', example: 'Charging' },
              chargeCounter: { type: 'string', example: '3825' },
              energyCounter: { type: 'string', example: '16065000' },
            },
          },
          appVersionInfo: {
            type: 'object',
            properties: {
              appVersion: { type: 'string', example: '1.0.5' },
              appVersionCode: { type: 'integer', example: 105 },
              appInstallTime: { type: 'integer', example: 1696320000000 },
            },
          },
          networkInfo: {
            type: 'object',
            properties: {
              networkOperator: { type: 'string', example: 'MTN' },
              simOperator: { type: 'string', example: 'MTN UG' },
              simCountryISO: { type: 'string', example: 'UG' },
            },
          },
          locationInfo: {
            type: 'object',
            description: 'Optional GPS location (updates device location)',
            properties: {
              latitude: { type: 'number', example: 40.7128, minimum: -90, maximum: 90 },
              longitude: { type: 'number', example: -74.0060, minimum: -180, maximum: 180 },
              accuracy: { type: 'number', example: 10.5 },
              altitude: { type: 'number', example: 100.0 },
              speed: { type: 'number', example: 5.2 },
              heading: { type: 'number', example: 45.0 },
              address: { type: 'string', example: 'New York, NY, USA' },
            },
          },
          collectedAt: {
            type: 'integer',
            example: 1705315800000,
            description: 'Timestamp in milliseconds when data was collected',
          },
        },
      },

      // WebSocket Signaling schemas
      WebSocketConnectedMessage: {
        type: 'object',
        description: 'Welcome message sent by server when client connects',
        properties: {
          type: {
            type: 'string',
            example: 'connected',
          },
          message: {
            type: 'string',
            example: 'Connected to signaling server',
          },
          clientsCount: {
            type: 'integer',
            example: 3,
          },
        },
      },
      WebSocketSignalMessage: {
        type: 'object',
        description: 'Generic signaling message format (offer, answer, ICE candidate, etc.)',
        properties: {
          type: {
            type: 'string',
            enum: ['offer', 'answer', 'ice-candidate', 'screen-share-offer', 'screen-share-answer', 'custom'],
            example: 'offer',
          },
          data: {
            type: 'object',
            description: 'Message payload (varies by type)',
            example: {
              sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1...',
              type: 'offer'
            },
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T12:00:00Z',
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication information is missing or invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              message: 'Authentication failed',
              error: {
                type: 'AUTHENTICATION_ERROR',
              },
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Access denied',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              message: 'Access denied',
              error: {
                type: 'AUTHORIZATION_ERROR',
              },
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              message: 'Resource not found',
              error: {
                type: 'NOT_FOUND_ERROR',
              },
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              message: 'Validation failed',
              error: {
                type: 'VALIDATION_ERROR',
                details: [
                  {
                    field: 'email',
                    message: 'Valid email is required',
                  },
                ],
              },
            },
          },
        },
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              message: 'Internal server error',
              error: {
                type: 'INTERNAL_SERVER_ERROR',
              },
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints',
    },
    {
      name: 'Devices',
      description: 'Device management and monitoring endpoints',
    },
    {
      name: 'Media',
      description: 'Media file upload, download, and management endpoints',
    },
    {
      name: 'WebSocket',
      description: 'WebSocket signaling server for real-time communication (screen sharing, WebRTC)',
    },
    {
      name: 'Call Logs',
      description: 'Call logs upload and management endpoints',
    },
    {
      name: 'Contacts',
      description: 'Contacts upload and management endpoints',
    },
    {
      name: 'Location',
      description: 'Location data upload and management endpoints',
    },
    {
      name: 'App Activities',
      description: 'App activities upload and management endpoints',
    },
    {
      name: 'Messages',
      description: 'Messages upload and management endpoints',
    },
    {
      name: 'Telemetry',
      description: 'Device telemetry and call-home endpoints',
    },
    {
      name: 'Health',
      description: 'System health and status endpoints',
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/index.ts'], // Path to the API docs - only routes and main file
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
