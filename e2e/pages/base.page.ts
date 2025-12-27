import { Page, Locator, expect } from '@playwright/test';
import { WaitHelpers } from '../utils/wait-helpers';

/**
 * Base page object with common functionality.
 * All other page objects should extend this class.
 */
export class BasePage {
  readonly page: Page;
  readonly waitHelpers: WaitHelpers;

  /** Navigation bar */
  readonly navbar: Locator;

  /** Flash messages container */
  readonly flashMessages: Locator;

  /** User menu button */
  readonly userMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.waitHelpers = new WaitHelpers(page);

    // Common locators
    this.navbar = page.locator('nav');
    this.flashMessages = page.locator('.alert, [data-controller="alert"]');
    this.userMenuButton = page.locator('button:has-text("Open user menu")');
  }

  /**
   * Navigate to a path and wait for page to be ready.
   */
  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
    await this.waitHelpers.waitForPageReady();
  }

  /**
   * Get the current URL path.
   */
  async getCurrentPath(): Promise<string> {
    return new URL(this.page.url()).pathname;
  }

  /**
   * Check if the current URL matches a pattern.
   */
  async urlMatches(pattern: RegExp): Promise<boolean> {
    const url = this.page.url();
    return pattern.test(url);
  }

  /**
   * Expect a flash message to be visible.
   */
  async expectFlashMessage(message: string | RegExp): Promise<void> {
    await expect(this.flashMessages).toContainText(message);
  }

  /**
   * Click an element and wait for Turbo navigation.
   */
  async clickWithTurbo(locator: Locator): Promise<void> {
    await locator.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Click an element and wait for StimulusReflex.
   */
  async clickWithReflex(locator: Locator): Promise<void> {
    await locator.click();
    await this.waitHelpers.waitForReflex();
  }

  /**
   * Fill an input and wait for debounced reflex.
   */
  async fillWithDebounce(locator: Locator, text: string, debounceMs = 300): Promise<void> {
    await locator.fill(text);
    await this.waitHelpers.waitForDebouncedReflex(debounceMs);
  }

  /**
   * Submit a form and wait for navigation.
   */
  async submitForm(submitButton?: Locator): Promise<void> {
    const button = submitButton || this.page.locator('input[type="submit"], button[type="submit"]');
    await button.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Check if a user is logged in.
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
   * Navigate to home page.
   */
  async goHome(): Promise<void> {
    await this.navigateTo('/');
  }

  /**
   * Click on the Posts link in navbar (desktop only, not mobile menu).
   */
  async goToPosts(): Promise<void> {
    await this.clickWithTurbo(this.navbar.locator('a:has-text("Posts"):not(#mobile-menu a)').first());
  }

  /**
   * Click on the Gists link in navbar (desktop only, not mobile menu).
   */
  async goToGists(): Promise<void> {
    await this.clickWithTurbo(this.navbar.locator('a:has-text("Gists"):not(#mobile-menu a)').first());
  }

  /**
   * Click on the Guilds link in navbar (desktop only, not mobile menu).
   */
  async goToGuilds(): Promise<void> {
    await this.clickWithTurbo(this.navbar.locator('a:has-text("Guilds"):not(#mobile-menu a)').first());
  }

  /**
   * Click on the Users link in navbar (desktop only, not mobile menu).
   */
  async goToUsers(): Promise<void> {
    await this.clickWithTurbo(this.navbar.locator('a:has-text("Users"):not(#mobile-menu a)').first());
  }

  /**
   * Take a screenshot for debugging.
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }
}
