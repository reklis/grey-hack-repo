/**
 * Test user credentials and data.
 * These users should be seeded in the test database.
 */

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

/**
 * Primary test user - used for most tests.
 */
export const primaryUser: TestUser = {
  name: process.env.TEST_USER_PRIMARY_NAME || 'testuser1',
  email: process.env.TEST_USER_PRIMARY_EMAIL || 'testuser1@test.com',
  password: process.env.TEST_USER_PRIMARY_PASSWORD || 'Password123!',
};

/**
 * Secondary test user - used for multi-user interaction tests.
 */
export const secondaryUser: TestUser = {
  name: process.env.TEST_USER_SECONDARY_NAME || 'testuser2',
  email: process.env.TEST_USER_SECONDARY_EMAIL || 'testuser2@test.com',
  password: process.env.TEST_USER_SECONDARY_PASSWORD || 'Password456!',
};

/**
 * Guild owner test user - used for guild-related tests.
 */
export const guildOwnerUser: TestUser = {
  name: process.env.TEST_USER_GUILD_OWNER_NAME || 'guildowner',
  email: process.env.TEST_USER_GUILD_OWNER_EMAIL || 'guildowner@test.com',
  password: process.env.TEST_USER_GUILD_OWNER_PASSWORD || 'GuildPass123!',
};

/**
 * All test users as a collection.
 */
export const testUsers = {
  primary: primaryUser,
  secondary: secondaryUser,
  guildOwner: guildOwnerUser,
} as const;

/**
 * Generate a new random user for registration tests.
 */
export function generateNewUser(): TestUser {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return {
    name: `new_${timestamp}${random}`.substring(0, 20),
    email: `new_${timestamp}${random}@e2e.test`,
    password: 'NewUser123!',
  };
}
