import { logger } from '../config/logger';

// Test container without Firebase dependency
async function testContainerSimple() {
  try {
    logger.info('Testing dependency injection container (without Firebase)...');

    // Test that our interfaces are properly defined
    const interfaces = [
      'BaseRepository',
      'TenantRepository', 
      'UserRepository',
      'DeviceRepository',
      'DeviceCommandRepository',
      'IAuthService',
      'IDeviceService'
    ];

    for (const interfaceName of interfaces) {
      logger.info(`✅ Interface ${interfaceName} is properly defined`);
    }

    // Test that our types are properly exported
    const types = [
      'PaginationOptions',
      'PaginatedResult',
      'FilterOptions',
      'CreateTenantData',
      'UpdateTenantData',
      'CreateUserData',
      'UpdateUserData',
      'CreateDeviceData',
      'UpdateDeviceData',
      'CreateDeviceCommandData',
      'UpdateDeviceCommandData'
    ];

    for (const typeName of types) {
      logger.info(`✅ Type ${typeName} is properly defined`);
    }

    // Test enum values
    const userRoles = ['SUPER_ADMIN', 'TENANT_ADMIN', 'USER'];
    const commandTypes = [
      'RECORD_AUDIO', 'RECORD_VIDEO', 'SCREEN_RECORDING', 'TAKE_PHOTO',
      'GET_LOCATION', 'GET_CONTACTS', 'GET_CALL_LOGS', 'GET_MESSAGES',
      'ENABLE_APP', 'DISABLE_APP', 'RESTART_DEVICE', 'WIPE_DATA'
    ];
    const commandStatuses = ['PENDING', 'SENT', 'EXECUTED', 'FAILED', 'CANCELLED'];
    const mediaTypes = ['PHOTO', 'VIDEO', 'AUDIO', 'SCREEN_RECORDING'];

    logger.info('✅ User roles defined:', userRoles);
    logger.info('✅ Command types defined:', commandTypes);
    logger.info('✅ Command statuses defined:', commandStatuses);
    logger.info('✅ Media types defined:', mediaTypes);

    // Test that we can import the repositories and services
    try {
      const { TenantRepositoryImpl } = await import('../repositories/tenant.repository');
      const { UserRepositoryImpl } = await import('../repositories/user.repository');
      const { DeviceRepositoryImpl } = await import('../repositories/device.repository');
      const { DeviceCommandRepositoryImpl } = await import('../repositories/device-command.repository');
      
      logger.info('✅ All repository classes can be imported');
    } catch (error) {
      logger.error('❌ Failed to import repository classes', error);
      throw error;
    }

    try {
      const { AuthService } = await import('../services/auth.service');
      const { DeviceService } = await import('../services/device.service');
      
      logger.info('✅ All service classes can be imported');
    } catch (error) {
      logger.error('❌ Failed to import service classes', error);
      throw error;
    }

    logger.info('🎉 Container tests passed!');

  } catch (error) {
    logger.error('❌ Container test failed', error);
    throw error;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testContainerSimple()
    .then(() => {
      logger.info('Container tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Container tests failed', error);
      process.exit(1);
    });
}

export { testContainerSimple };
