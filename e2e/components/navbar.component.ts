import { Page, Locator } from '@playwright/test';
import { WaitHelpers } from '../utils/wait-helpers';

/**
 * Component for interacting with the navigation bar.
 */
export class NavbarComponent {
  readonly page: Page;
  readonly waitHelpers: WaitHelpers;

  /** Main navigation element */
  readonly nav: Locator;

  /** Logo/home link */
  readonly logo: Locator;

  /** Posts link */
  readonly postsLink: Locator;

  /** Gists link */
  readonly gistsLink: Locator;

  /** Guilds link */
  readonly guildsLink: Locator;

  /** Users link */
  readonly usersLink: Locator;

  /** Decipher link */
  readonly decipherLink: Locator;

  /** Docs link */
  readonly docsLink: Locator;

  /** User menu button */
  readonly userMenuButton: Locator;

  /** Notifications button */
  readonly notificationsButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.waitHelpers = new WaitHelpers(page);

    this.nav = page.locator('nav');
    this.logo = this.nav.locator('a[href="/"]').first();
    this.postsLink = this.nav.locator('a:has-text("Posts")');
    this.gistsLink = this.nav.locator('a:has-text("Gists")');
    this.guildsLink = this.nav.locator('a:has-text("Guilds")');
    this.usersLink = this.nav.locator('a:has-text("Users")');
    this.decipherLink = this.nav.locator('a:has-text("Decipher")');
    this.docsLink = this.nav.locator('a:has-text("Docs")');
    this.userMenuButton = this.nav.locator('button:has-text("Open user menu")');
    this.notificationsButton = this.nav.locator('[data-controller="notifications"] button, button[data-notifications]');
  }

  /**
   * Navigate to home page.
   */
  async goHome(): Promise<void> {
    await this.logo.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Navigate to posts page.
   */
  async goToPosts(): Promise<void> {
    await this.postsLink.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Navigate to gists page.
   */
  async goToGists(): Promise<void> {
    await this.gistsLink.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Navigate to guilds page.
   */
  async goToGuilds(): Promise<void> {
    await this.guildsLink.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Navigate to users page.
   */
  async goToUsers(): Promise<void> {
    await this.usersLink.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Navigate to NPC decipher page.
   */
  async goToDecipher(): Promise<void> {
    await this.decipherLink.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Open user menu dropdown.
   */
  async openUserMenu(): Promise<void> {
    await this.userMenuButton.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * Open notifications dropdown.
   */
  async openNotifications(): Promise<void> {
    await this.notificationsButton.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * Check if user is logged in (user menu visible).
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.userMenuButton.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Get login link.
   */
  getLoginLink(): Locator {
    return this.nav.locator('a[href="/users/sign_in"]');
  }

  /**
   * Get sign up link.
   */
  getSignUpLink(): Locator {
    return this.nav.locator('a[href="/users/sign_up"]');
  }

  /**
   * Navigate to login page.
   */
  async goToLogin(): Promise<void> {
    const loginLink = this.getLoginLink();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await this.waitHelpers.waitForTurbo();
    }
  }

  /**
   * Navigate to sign up page.
   */
  async goToSignUp(): Promise<void> {
    const signUpLink = this.getSignUpLink();
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await this.waitHelpers.waitForTurbo();
    }
  }
}
