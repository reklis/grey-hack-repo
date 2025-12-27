import { test as base, expect } from '@playwright/test';
import { AuthHelper, testUsers, TestUser, generateTestUser } from '../utils/auth';
import { WaitHelpers } from '../utils/wait-helpers';

/**
 * Extended test fixtures for Grey Repo E2E tests.
 */
type TestFixtures = {
  /** Authentication helper */
  auth: AuthHelper;

  /** Wait helpers for async operations */
  waitHelpers: WaitHelpers;

  /** The currently logged in user (after using loggedInAsPrimary etc.) */
  currentUser: TestUser | null;

  /** Fixture that creates and logs in as a fresh primary user before test */
  loggedInAsPrimary: TestUser;

  /** Fixture that creates and logs in as a fresh secondary user before test */
  loggedInAsSecondary: TestUser;

  /** Fixture that creates and logs in as a fresh guild owner before test */
  loggedInAsGuildOwner: TestUser;
};

/**
 * Extended test with custom fixtures.
 */
export const test = base.extend<TestFixtures>({
  /**
   * Auth helper fixture.
   */
  auth: async ({ page }, use) => {
    const auth = new AuthHelper(page);
    await use(auth);
  },

  /**
   * Wait helpers fixture.
   */
  waitHelpers: async ({ page }, use) => {
    const waitHelpers = new WaitHelpers(page);
    await use(waitHelpers);
  },

  /**
   * Current user fixture (null by default).
   */
  currentUser: async ({}, use) => {
    await use(null);
  },

  /**
   * Auto-create and login as primary user fixture.
   * Use this when tests require an authenticated user.
   */
  loggedInAsPrimary: async ({ auth }, use) => {
    const user = await auth.loginAsPrimary();
    await use(user);
  },

  /**
   * Auto-create and login as secondary user fixture.
   * Use this for multi-user interaction tests.
   */
  loggedInAsSecondary: async ({ auth }, use) => {
    const user = await auth.loginAsSecondary();
    await use(user);
  },

  /**
   * Auto-create and login as guild owner fixture.
   * Use this for guild management tests.
   */
  loggedInAsGuildOwner: async ({ auth }, use) => {
    const user = await auth.loginAsGuildOwner();
    await use(user);
  },
});

/**
 * Re-export expect for convenience.
 */
export { expect } from '@playwright/test';

/**
 * Re-export test users and generator for convenience.
 */
export { testUsers, generateTestUser };
export type { TestUser };
