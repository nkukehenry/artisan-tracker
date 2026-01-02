import { container } from '../config/container';
import { logger } from '../config/logger';

async function testRepositories() {
  try {
    logger.info('Starting repository and service tests...');

    // Test Tenant Repository
    logger.info('Testing Tenant Repository...');
    const tenantRepo = container.getTenantRepository();

    // Create a test tenant
    const testTenant = await tenantRepo.create({
      name: 'Test Company',
      domain: 'test-company.com',
      isActive: true,
    });
    logger.info('✅ Tenant created successfully', { tenantId: testTenant.id });

    // Find tenant by domain
    const foundTenant = await tenantRepo.findByDomain('test-company.com');
    if (foundTenant) {
      logger.info('✅ Tenant found by domain', { tenantId: foundTenant.id });
    }

    // Test User Repository
    logger.info('Testing User Repository...');
    const userRepo = container.getUserRepository();

    // Create a test user
    const testUser = await userRepo.create({
      email: 'test@test-company.com',
      password: 'hashedpassword123',
      firstName: 'Test',
      lastName: 'User',
      role: 'TENANT_ADMIN',
      tenantId: testTenant.id,
      isActive: true,
      lastLoginAt: null,
      isPasswordChanged: false,
    });
    logger.info('✅ User created successfully', { userId: testUser.id });

    // Find user by email
    const foundUser = await userRepo.findByEmail('test@test-company.com');
    if (foundUser) {
      logger.info('✅ User found by email', { userId: foundUser.id });
    }

    // Test Device Repository
    logger.info('Testing Device Repository...');
    const deviceRepo = container.getDeviceRepository();

    // Create a test device
    const testDevice = await deviceRepo.create({
      deviceId: 'TEST-DEVICE-001',
      name: 'Test Device',
      model: 'Test Model',
      osVersion: 'Android 13',
      appVersion: '1.0.0',
      tenantId: testTenant.id,
      userId: testUser.id,
      isActive: true,
      isOnline: false,
      lastSeenAt: null,
      batteryLevel: null,
      location: null,
      latestTelemetryId: null
    });
    logger.info('✅ Device created successfully', { deviceId: testDevice.id });

    // Find device by deviceId
    const foundDevice = await deviceRepo.findByDeviceId('TEST-DEVICE-001');
    if (foundDevice) {
      logger.info('✅ Device found by deviceId', { deviceId: foundDevice.id });
    }

    // Test Device Command Repository
    logger.info('Testing Device Command Repository...');
    const commandRepo = container.getDeviceCommandRepository();

    // Create a test command
    const testCommand = await commandRepo.create({
      deviceId: testDevice.id,
      command: 'GET_LOCATION',
      payload: { accuracy: 'high' },
      status: 'PENDING',
      sentAt: new Date(),
      executedAt: null,
      response: null,
    });
    logger.info('✅ Device command created successfully', { commandId: testCommand.id });

    // Test Services
    logger.info('Testing Services...');
    const authService = container.getAuthService();
    const deviceService = container.getDeviceService();

    // Test device stats
    const deviceStats = await deviceService.getDeviceStats(testTenant.id);
    logger.info('✅ Device stats retrieved', deviceStats);

    // Test command stats
    const commandStats = await commandRepo.getCommandStats(testDevice.id);
    logger.info('✅ Command stats retrieved', commandStats);

    // Clean up test data
    logger.info('Cleaning up test data...');
    await commandRepo.delete(testCommand.id);
    await deviceRepo.delete(testDevice.id);
    await userRepo.delete(testUser.id);
    await tenantRepo.delete(testTenant.id);
    logger.info('✅ Test data cleaned up successfully');

    logger.info('🎉 All repository and service tests passed!');

  } catch (error) {
    logger.error('❌ Test failed', error);
    throw error;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testRepositories()
    .then(() => {
      logger.info('Tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Tests failed', error);
      process.exit(1);
    });
}

export { testRepositories };
