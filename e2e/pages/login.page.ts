import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page object for the login page.
 */
export class LoginPage extends BasePage {
  /** Username/name input field */
  readonly nameInput: Locator;

  /** Password input field */
  readonly passwordInput: Locator;

  /** Remember me checkbox */
  readonly rememberMeCheckbox: Locator;

  /** Submit button */
  readonly submitButton: Locator;

  /** Sign up link */
  readonly signUpLink: Locator;

  /** Forgot password link */
  readonly forgotPasswordLink: Locator;

  /** Error message */
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.nameInput = page.getByRole('textbox', { name: 'Name *' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password *' });
    this.rememberMeCheckbox = page.getByRole('checkbox', { name: 'Remember me' });
    this.submitButton = page.getByRole('button', { name: 'Log in' });
    this.signUpLink = page.locator('a[href="/users/sign_up"]');
    this.forgotPasswordLink = page.locator('a[href="/users/password/new"]');
    this.errorMessage = page.locator('.alert-error, .text-red-400, [data-error]');
  }

  /**
   * Navigate to the login page.
   */
  async goto(): Promise<void> {
    await this.navigateTo('/users/sign_in');
  }

  /**
   * Login with username and password.
   */
  async login(username: string, password: string, rememberMe = false): Promise<void> {
    await this.nameInput.fill(username);
    await this.passwordInput.fill(password);

    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }

    await this.submitButton.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Check if login was successful (redirected away from login page).
   */
  async isLoginSuccessful(): Promise<boolean> {
    const currentPath = await this.getCurrentPath();
    return !currentPath.includes('/sign_in');
  }

  /**
   * Get error message text.
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.errorMessage.isVisible({ timeout: 1000 }).catch(() => false)) {
      return await this.errorMessage.textContent();
    }
    return null;
  }

  /**
   * Navigate to sign up page.
   */
  async goToSignUp(): Promise<void> {
    await this.signUpLink.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Navigate to forgot password page.
   */
  async goToForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
    await this.waitHelpers.waitForTurbo();
  }
}
