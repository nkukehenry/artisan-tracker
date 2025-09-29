import { container } from '../config/container';
import { logger } from '../config/logger';

async function testContainer() {
  try {
    logger.info('Testing dependency injection container...');

    // Test repository instantiation
    logger.info('Testing repository instantiation...');
    const tenantRepo = container.getTenantRepository();
    const userRepo = container.getUserRepository();
    const deviceRepo = container.getDeviceRepository();
    const commandRepo = container.getDeviceCommandRepository();

    if (tenantRepo && userRepo && deviceRepo && commandRepo) {
      logger.info('✅ All repositories instantiated successfully');
    } else {
      throw new Error('Failed to instantiate repositories');
    }

    // Test service instantiation
    logger.info('Testing service instantiation...');
    const authService = container.getAuthService();
    const deviceService = container.getDeviceService();

    if (authService && deviceService) {
      logger.info('✅ All services instantiated successfully');
    } else {
      throw new Error('Failed to instantiate services');
    }

    // Test generic getter
    logger.info('Testing generic getter...');
    const tenantRepoGeneric = container.get('tenantRepository');
    const authServiceGeneric = container.get('authService');

    if (tenantRepoGeneric && authServiceGeneric) {
      logger.info('✅ Generic getter works correctly');
    } else {
      throw new Error('Generic getter failed');
    }

    logger.info('🎉 Container tests passed!');

  } catch (error) {
    logger.error('❌ Container test failed', error);
    throw error;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testContainer()
    .then(() => {
      logger.info('Container tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Container tests failed', error);
      process.exit(1);
    });
}

export { testContainer };
