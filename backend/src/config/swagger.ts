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
      description: 'Development server (API)',
    },
    {
      url: 'http://localhost:83',
      description: 'Development server (Root)',
    },
    {
      url: 'https://tracker.mutindo.com/api',
      description: 'Production server (API)',
    },
    {
      url: 'https://tracker.mutindo.com',
      description: 'Production server (Root)',
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
          file: {
            type: 'string',
            format: 'binary',
            description: 'File to upload',
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
      name: 'Health',
      description: 'System health and status endpoints',
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/index.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
