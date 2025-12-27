import { FullConfig } from '@playwright/test';

/**
 * Global teardown runs once after all tests complete.
 * Used for cleanup operations.
 */
async function globalTeardown(config: FullConfig) {
  console.log('E2E teardown complete');
}

export default globalTeardown;
