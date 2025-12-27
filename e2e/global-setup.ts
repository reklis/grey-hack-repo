import { FullConfig } from '@playwright/test';

/**
 * Global setup runs once before all tests.
 * Used to seed test data and prepare the environment.
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use?.baseURL || 'http://localhost:3000';

  console.log('Setting up E2E test environment...');
  console.log(`Base URL: ${baseURL}`);

  // Verify the application is running
  try {
    const response = await fetch(baseURL);
    if (!response.ok) {
      throw new Error(`Application returned status ${response.status}`);
    }
    console.log('Application is running and accessible');
  } catch (error) {
    console.error('Failed to connect to application:', error);
    console.error('Please ensure the Rails server is running on port 3000');
    throw error;
  }

  console.log('E2E setup complete');
}

export default globalSetup;
