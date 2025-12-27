import { Page } from '@playwright/test';
import { WaitHelpers } from './wait-helpers';
import { confirmEmail } from './mailpit';

/**
 * Test user interface.
 */
export interface TestUser {
  name: string;
  email: string;
  password: string;
}

/**
 * Generate a unique test user with random credentials.
 * Username is max 16 characters.
 */
export function generateTestUser(prefix = 'u'): TestUser {
  const random = Math.random().toString(36).substring(2, 10);
  const name = `${prefix}${random}`.substring(0, 16);
  return {
    name,
    email: `${name}@e2e.test`,
    password: 'Password123!',
  };
}

/**
 * Pre-generated test users (for reference, but prefer generateTestUser).
 */
export const testUsers = {
  primary: generateTestUser('primary'),
  secondary: generateTestUser('secondary'),
  guildOwner: generateTestUser('guildowner'),
};

/**
 * Authentication helper for E2E tests.
 * Provides UI-based login/logout functionality.
 */
export class AuthHelper {
  private page: Page;
  private waitHelpers: WaitHelpers;

  constructor(page: Page) {
    this.page = page;
    this.waitHelpers = new WaitHelpers(page);
  }

  /**
   * Login a user via the UI login form.
   */
  async login(user: TestUser): Promise<void> {
    await this.page.goto('/users/sign_in');
    await this.waitHelpers.waitForPageReady();

    // Fill login form using roles
    await this.page.getByRole('textbox', { name: 'Name *' }).fill(user.name);
    await this.page.getByRole('textbox', { name: 'Password *' }).fill(user.password);

    // Submit form
    await this.page.getByRole('button', { name: 'Log in' }).click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Login as the primary test user (creates fresh user).
   */
  async loginAsPrimary(): Promise<TestUser> {
    return await this.createAndLogin(generateTestUser('primary'));
  }

  /**
   * Login as the secondary test user (creates fresh user).
   */
  async loginAsSecondary(): Promise<TestUser> {
    return await this.createAndLogin(generateTestUser('secondary'));
  }

  /**
   * Login as the guild owner test user (creates fresh user).
   */
  async loginAsGuildOwner(): Promise<TestUser> {
    return await this.createAndLogin(generateTestUser('guildowner'));
  }

  /**
   * Logout the current user.
   */
  async logout(): Promise<void> {
    // Navigate to home first to ensure nav is visible
    await this.page.goto('/');
    await this.waitHelpers.waitForPageReady();

    // Dismiss any toast notifications by clicking close button
    const toastCloseButton = this.page.locator('[data-controller="toast"] button, .toast button, .alert button');
    if (await toastCloseButton.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      await toastCloseButton.first().click();
      await this.page.waitForTimeout(300);
    }

    // Also try to wait for toast to auto-hide
    const toast = this.page.locator('[data-controller="toast"], .toast');
    try {
      await toast.first().waitFor({ state: 'hidden', timeout: 3000 });
    } catch {
      // Toast might already be hidden or doesn't exist - continue anyway
    }

    // Open user menu dropdown first (use force to click through any remaining overlays)
    const userMenuButton = this.page.getByRole('button', { name: 'Open user menu' });
    if (await userMenuButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await userMenuButton.click({ force: true });
      await this.page.waitForTimeout(200); // Wait for dropdown to open

      // Click sign out link
      const signOutLink = this.page.getByRole('link', { name: 'Sign out' });
      await signOutLink.click();
      await this.waitHelpers.waitForTurbo();
    }
  }

  /**
   * Check if a user is currently logged in.
   */
  async isLoggedIn(): Promise<boolean> {
    // Dismiss any toast notifications that might block the menu
    const toastCloseButton = this.page.locator('[data-controller="toast"] button');
    if (await toastCloseButton.isVisible({ timeout: 500 }).catch(() => false)) {
      await toastCloseButton.click();
      await this.page.waitForTimeout(300);
    }

    // Open user menu to check for Sign out link
    const userMenuButton = this.page.getByRole('button', { name: 'Open user menu' });

    if (!await userMenuButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      return false;
    }

    await userMenuButton.click();
    await this.page.waitForTimeout(200);

    // Check for Sign out link (only visible when logged in)
    const signOutLink = this.page.getByRole('link', { name: 'Sign out' });
    const isLoggedIn = await signOutLink.isVisible({ timeout: 1000 }).catch(() => false);

    // Close menu by clicking elsewhere
    await this.page.keyboard.press('Escape');

    return isLoggedIn;
  }

  /**
   * Ensure a user is logged in, logging in if necessary.
   */
  async ensureLoggedIn(user: TestUser = testUsers.primary): Promise<void> {
    const isLoggedIn = await this.isLoggedIn();
    if (!isLoggedIn) {
      await this.login(user);
    }
  }

  /**
   * Register a new user via the UI registration form.
   * Note: This only submits the registration form. Call registerAndConfirm
   * to also confirm the email via mailpit.
   */
  async register(user: TestUser): Promise<void> {
    await this.page.goto('/users/sign_up');
    await this.waitHelpers.waitForPageReady();

    // Fill registration form using roles
    await this.page.getByRole('textbox', { name: 'Name *' }).fill(user.name);
    await this.page.getByRole('textbox', { name: 'Email *' }).fill(user.email);
    await this.page.getByRole('textbox', { name: 'Password *' }).fill(user.password);
    await this.page.getByRole('textbox', { name: 'Password_confirmation *' }).fill(user.password);

    // Submit form
    await this.page.getByRole('button', { name: 'Sign up' }).click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Register a new user and confirm their email via mailpit.
   * This completes the full registration flow.
   */
  async registerAndConfirm(user: TestUser): Promise<boolean> {
    await this.register(user);

    // Confirm email via mailpit
    const confirmed = await confirmEmail(this.page, user.email);
    return confirmed;
  }

  /**
   * Create a new user (register + confirm email) and log them in.
   * Returns the created user object.
   */
  async createAndLogin(user?: TestUser): Promise<TestUser> {
    const newUser = user || generateTestUser();

    // Register and confirm email
    const confirmed = await this.registerAndConfirm(newUser);
    if (!confirmed) {
      throw new Error(`Failed to confirm email for user: ${newUser.email}`);
    }

    // Now login
    await this.login(newUser);

    return newUser;
  }

  /**
   * Create and login as a fresh primary user.
   */
  async loginAsFreshPrimary(): Promise<TestUser> {
    return await this.createAndLogin(generateTestUser('primary'));
  }

  /**
   * Create and login as a fresh secondary user.
   */
  async loginAsFreshSecondary(): Promise<TestUser> {
    return await this.createAndLogin(generateTestUser('secondary'));
  }

  /**
   * Create and login as a fresh guild owner user.
   */
  async loginAsFreshGuildOwner(): Promise<TestUser> {
    return await this.createAndLogin(generateTestUser('guildowner'));
  }

  /**
   * Get the current user's display name from the page.
   */
  async getCurrentUserName(): Promise<string | null> {
    const userNameElement = this.page.locator('[data-user-name]');
    if (await userNameElement.isVisible({ timeout: 1000 }).catch(() => false)) {
      return await userNameElement.textContent();
    }
    return null;
  }
}
