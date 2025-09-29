import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../src/config/logger';

const prisma = new PrismaClient();

async function main() {
  logger.info('🌱 Starting database seeding...');

  // Clear existing data (in development only)
  if (process.env.NODE_ENV === 'development') {
    logger.info('🧹 Clearing existing data...');
    
    await prisma.deviceCommand.deleteMany();
    await prisma.mediaFile.deleteMany();
    await prisma.callLog.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.message.deleteMany();
    await prisma.location.deleteMany();
    await prisma.appActivity.deleteMany();
    await prisma.device.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.systemLog.deleteMany();
  }

  // Create Tenants
  logger.info('🏢 Creating tenants...');
  
  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'Acme Corporation',
      domain: 'acme.com',
      isActive: true,
    },
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'TechStart Inc',
      domain: 'techstart.io',
      isActive: true,
    },
  });

  const tenant3 = await prisma.tenant.create({
    data: {
      name: 'Global Enterprises',
      domain: 'globalent.com',
      isActive: true,
    },
  });

  logger.info(`✅ Created ${3} tenants`);

  // Create Users
  logger.info('👥 Creating users...');
  
  const hashedPassword = await bcrypt.hash('password123', 12);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@mobiletracker.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
      tenantId: tenant1.id,
    },
  });

  const tenant1Admin = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'TENANT_ADMIN',
      isActive: true,
      tenantId: tenant1.id,
    },
  });

  const tenant1User = await prisma.user.create({
    data: {
      email: 'user1@acme.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'USER',
      isActive: true,
      tenantId: tenant1.id,
    },
  });

  const tenant2Admin = await prisma.user.create({
    data: {
      email: 'admin@techstart.io',
      password: hashedPassword,
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'TENANT_ADMIN',
      isActive: true,
      tenantId: tenant2.id,
    },
  });

  const tenant2User = await prisma.user.create({
    data: {
      email: 'user2@techstart.io',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'USER',
      isActive: true,
      tenantId: tenant2.id,
    },
  });

  logger.info(`✅ Created ${5} users`);

  // Create Subscriptions
  logger.info('💳 Creating subscriptions...');
  
  await prisma.subscription.create({
    data: {
      plan: 'PREMIUM',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      maxDevices: 50,
      features: {
        realTimeTracking: true,
        screenRecording: true,
        callLogging: true,
        messageMonitoring: true,
        locationHistory: true,
        appControl: true,
      },
      tenantId: tenant1.id,
    },
  });

  await prisma.subscription.create({
    data: {
      plan: 'BASIC',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      maxDevices: 10,
      features: {
        realTimeTracking: true,
        screenRecording: false,
        callLogging: true,
        messageMonitoring: false,
        locationHistory: true,
        appControl: false,
      },
      tenantId: tenant2.id,
    },
  });

  logger.info(`✅ Created ${2} subscriptions`);

  // Create Devices
  logger.info('📱 Creating devices...');
  
  const device1 = await prisma.device.create({
    data: {
      deviceId: 'ACME-001',
      name: 'John\'s iPhone',
      model: 'iPhone 14 Pro',
      osVersion: 'iOS 16.0',
      appVersion: '1.0.0',
      isOnline: true,
      lastSeenAt: new Date(),
      batteryLevel: 85,
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        address: 'New York, NY, USA',
      },
      isActive: true,
      tenantId: tenant1.id,
      userId: tenant1User.id,
    },
  });

  const device2 = await prisma.device.create({
    data: {
      deviceId: 'ACME-002',
      name: 'Jane\'s Android',
      model: 'Samsung Galaxy S23',
      osVersion: 'Android 13',
      appVersion: '1.0.0',
      isOnline: false,
      lastSeenAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      batteryLevel: 45,
      location: {
        latitude: 40.7589,
        longitude: -73.9851,
        accuracy: 15,
        address: 'Times Square, New York, NY, USA',
      },
      isActive: true,
      tenantId: tenant1.id,
      userId: tenant1User.id,
    },
  });

  const device3 = await prisma.device.create({
    data: {
      deviceId: 'TECH-001',
      name: 'Mike\'s Work Phone',
      model: 'Google Pixel 7',
      osVersion: 'Android 13',
      appVersion: '1.0.0',
      isOnline: true,
      lastSeenAt: new Date(),
      batteryLevel: 92,
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 8,
        address: 'San Francisco, CA, USA',
      },
      isActive: true,
      tenantId: tenant2.id,
      userId: tenant2User.id,
    },
  });

  logger.info(`✅ Created ${3} devices`);

  // Create Device Commands
  logger.info('📋 Creating device commands...');
  
  await prisma.deviceCommand.create({
    data: {
      command: 'GET_LOCATION',
      payload: { accuracy: 'high' },
      status: 'EXECUTED',
      sentAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      executedAt: new Date(Date.now() - 29 * 60 * 1000), // 29 minutes ago
      response: { success: true, location: { lat: 40.7128, lng: -74.0060 } },
      deviceId: device1.id,
    },
  });

  await prisma.deviceCommand.create({
    data: {
      command: 'TAKE_PHOTO',
      payload: { quality: 'high' },
      status: 'PENDING',
      sentAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      deviceId: device1.id,
    },
  });

  await prisma.deviceCommand.create({
    data: {
      command: 'GET_CALL_LOGS',
      payload: { limit: 50 },
      status: 'EXECUTED',
      sentAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      executedAt: new Date(Date.now() - 59 * 60 * 1000), // 59 minutes ago
      response: { success: true, count: 25 },
      deviceId: device2.id,
    },
  });

  logger.info(`✅ Created ${3} device commands`);

  // Create Media Files
  logger.info('📸 Creating media files...');
  
  await prisma.mediaFile.create({
    data: {
      fileName: 'photo_001.jpg',
      filePath: '/uploads/photos/photo_001.jpg',
      fileSize: BigInt(2048576), // 2MB
      mimeType: 'image/jpeg',
      fileType: 'PHOTO',
      metadata: {
        width: 1920,
        height: 1080,
        camera: 'iPhone 14 Pro',
        timestamp: new Date().toISOString(),
      },
      isEncrypted: true,
      deviceId: device1.id,
    },
  });

  await prisma.mediaFile.create({
    data: {
      fileName: 'video_001.mp4',
      filePath: '/uploads/videos/video_001.mp4',
      fileSize: BigInt(15728640), // 15MB
      mimeType: 'video/mp4',
      fileType: 'VIDEO',
      metadata: {
        duration: 30,
        resolution: '1920x1080',
        fps: 30,
        timestamp: new Date().toISOString(),
      },
      isEncrypted: true,
      deviceId: device1.id,
    },
  });

  await prisma.mediaFile.create({
    data: {
      fileName: 'audio_001.m4a',
      filePath: '/uploads/audio/audio_001.m4a',
      fileSize: BigInt(5242880), // 5MB
      mimeType: 'audio/m4a',
      fileType: 'AUDIO',
      metadata: {
        duration: 120,
        bitrate: 128,
        sampleRate: 44100,
        timestamp: new Date().toISOString(),
      },
      isEncrypted: true,
      deviceId: device2.id,
    },
  });

  logger.info(`✅ Created ${3} media files`);

  // Create Call Logs
  logger.info('📞 Creating call logs...');
  
  await prisma.callLog.create({
    data: {
      phoneNumber: '+1234567890',
      contactName: 'John Smith',
      callType: 'INCOMING',
      duration: 180, // 3 minutes
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isIncoming: true,
      deviceId: device1.id,
    },
  });

  await prisma.callLog.create({
    data: {
      phoneNumber: '+1987654321',
      contactName: 'Jane Doe',
      callType: 'OUTGOING',
      duration: 240, // 4 minutes
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      isIncoming: false,
      deviceId: device1.id,
    },
  });

  await prisma.callLog.create({
    data: {
      phoneNumber: '+1555123456',
      contactName: 'Unknown',
      callType: 'MISSED',
      duration: 0,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      isIncoming: true,
      deviceId: device2.id,
    },
  });

  logger.info(`✅ Created ${3} call logs`);

  // Create Contacts
  logger.info('👤 Creating contacts...');
  
  await prisma.contact.create({
    data: {
      name: 'John Smith',
      phoneNumber: '+1234567890',
      email: 'john.smith@email.com',
      avatar: '/avatars/john_smith.jpg',
      deviceId: device1.id,
    },
  });

  await prisma.contact.create({
    data: {
      name: 'Jane Doe',
      phoneNumber: '+1987654321',
      email: 'jane.doe@email.com',
      deviceId: device1.id,
    },
  });

  await prisma.contact.create({
    data: {
      name: 'Mike Johnson',
      phoneNumber: '+1555123456',
      email: 'mike.johnson@email.com',
      avatar: '/avatars/mike_johnson.jpg',
      deviceId: device2.id,
    },
  });

  logger.info(`✅ Created ${3} contacts`);

  // Create Messages
  logger.info('💬 Creating messages...');
  
  await prisma.message.create({
    data: {
      content: 'Hey, how are you doing?',
      messageType: 'SMS',
      sender: '+1234567890',
      recipient: '+1987654321',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      isRead: true,
      metadata: {
        threadId: 'thread_001',
        messageId: 'msg_001',
      },
      deviceId: device1.id,
    },
  });

  await prisma.message.create({
    data: {
      content: 'Can we meet tomorrow?',
      messageType: 'WHATSAPP',
      sender: '+1987654321',
      recipient: '+1234567890',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      isRead: false,
      metadata: {
        threadId: 'thread_001',
        messageId: 'msg_002',
        platform: 'whatsapp',
      },
      deviceId: device1.id,
    },
  });

  logger.info(`✅ Created ${2} messages`);

  // Create Locations
  logger.info('📍 Creating location history...');
  
  await prisma.location.create({
    data: {
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 10,
      altitude: 10,
      speed: 0,
      heading: 0,
      address: 'New York, NY, USA',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      deviceId: device1.id,
    },
  });

  await prisma.location.create({
    data: {
      latitude: 40.7589,
      longitude: -73.9851,
      accuracy: 15,
      altitude: 15,
      speed: 5.5,
      heading: 45,
      address: 'Times Square, New York, NY, USA',
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      deviceId: device1.id,
    },
  });

  await prisma.location.create({
    data: {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 8,
      altitude: 20,
      speed: 0,
      heading: 0,
      address: 'San Francisco, CA, USA',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      deviceId: device3.id,
    },
  });

  logger.info(`✅ Created ${3} location records`);

  // Create App Activities
  logger.info('📱 Creating app activities...');
  
  await prisma.appActivity.create({
    data: {
      appName: 'WhatsApp',
      packageName: 'com.whatsapp',
      isActive: true,
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      duration: 3600, // 1 hour
      deviceId: device1.id,
    },
  });

  await prisma.appActivity.create({
    data: {
      appName: 'Instagram',
      packageName: 'com.instagram.android',
      isActive: false,
      startTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      endTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      duration: 3600, // 1 hour
      deviceId: device1.id,
    },
  });

  await prisma.appActivity.create({
    data: {
      appName: 'Chrome',
      packageName: 'com.android.chrome',
      isActive: true,
      startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      duration: 1800, // 30 minutes (still active)
      deviceId: device3.id,
    },
  });

  logger.info(`✅ Created ${3} app activities`);

  // Create System Logs
  logger.info('📝 Creating system logs...');
  
  await prisma.systemLog.create({
    data: {
      level: 'INFO',
      message: 'Device registered successfully',
      metadata: {
        deviceId: device1.deviceId,
        tenantId: tenant1.id,
        userId: tenant1User.id,
      },
      userId: tenant1User.id,
      deviceId: device1.id,
      ipAddress: '192.168.1.100',
      userAgent: 'MobileTracker/1.0.0 (iOS 16.0; iPhone 14 Pro)',
    },
  });

  await prisma.systemLog.create({
    data: {
      level: 'WARN',
      message: 'Device battery level low',
      metadata: {
        deviceId: device2.deviceId,
        batteryLevel: 15,
      },
      userId: tenant1User.id,
      deviceId: device2.id,
      ipAddress: '192.168.1.101',
      userAgent: 'MobileTracker/1.0.0 (Android 13; Samsung Galaxy S23)',
    },
  });

  await prisma.systemLog.create({
    data: {
      level: 'ERROR',
      message: 'Failed to send device command',
      metadata: {
        deviceId: device1.deviceId,
        command: 'TAKE_PHOTO',
        error: 'Camera permission denied',
      },
      userId: tenant1User.id,
      deviceId: device1.id,
      ipAddress: '192.168.1.100',
      userAgent: 'MobileTracker/1.0.0 (iOS 16.0; iPhone 14 Pro)',
    },
  });

  logger.info(`✅ Created ${3} system logs`);

  // Summary
  logger.info('🎉 Database seeding completed successfully!');
  logger.info('📊 Summary:');
  logger.info(`   - Tenants: ${3}`);
  logger.info(`   - Users: ${5}`);
  logger.info(`   - Subscriptions: ${2}`);
  logger.info(`   - Devices: ${3}`);
  logger.info(`   - Device Commands: ${3}`);
  logger.info(`   - Media Files: ${3}`);
  logger.info(`   - Call Logs: ${3}`);
  logger.info(`   - Contacts: ${3}`);
  logger.info(`   - Messages: ${2}`);
  logger.info(`   - Locations: ${3}`);
  logger.info(`   - App Activities: ${3}`);
  logger.info(`   - System Logs: ${3}`);

  logger.info('🔑 Test Credentials:');
  logger.info('   - Super Admin: admin@mobiletracker.com / password123');
  logger.info('   - Tenant Admin: admin@acme.com / password123');
  logger.info('   - Regular User: user1@acme.com / password123');
}

main()
  .catch((e) => {
    logger.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
