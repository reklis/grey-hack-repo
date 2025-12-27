import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { confirmEmail } from '../utils/mailpit';

/**
 * Page object for the registration page.
 */
export class RegisterPage extends BasePage {
  /** Username input field */
  readonly nameInput: Locator;

  /** Email input field */
  readonly emailInput: Locator;

  /** Password input field */
  readonly passwordInput: Locator;

  /** Password confirmation input field */
  readonly passwordConfirmationInput: Locator;

  /** Submit button */
  readonly submitButton: Locator;

  /** Sign in link */
  readonly signInLink: Locator;

  /** Error messages container */
  readonly errorMessages: Locator;

  constructor(page: Page) {
    super(page);

    this.nameInput = page.getByRole('textbox', { name: 'Name *' });
    this.emailInput = page.getByRole('textbox', { name: 'Email *' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password *' });
    this.passwordConfirmationInput = page.getByRole('textbox', { name: 'Password_confirmation *' });
    this.submitButton = page.getByRole('button', { name: 'Sign up' });
    this.signInLink = page.locator('a[href="/users/sign_in"]');
    this.errorMessages = page.locator('.field-error, .text-red-400, [data-error], #error_explanation');
  }

  /**
   * Navigate to the registration page.
   */
  async goto(): Promise<void> {
    await this.navigateTo('/users/sign_up');
  }

  /**
   * Register a new user.
   */
  async register(name: string, email: string, password: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.passwordConfirmationInput.fill(password);

    await this.submitButton.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Register with separate password confirmation.
   */
  async registerWithConfirmation(
    name: string,
    email: string,
    password: string,
    confirmation: string
  ): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.passwordConfirmationInput.fill(confirmation);

    await this.submitButton.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Check if registration was successful.
   */
  async isRegistrationSuccessful(): Promise<boolean> {
    const currentPath = await this.getCurrentPath();
    return !currentPath.includes('/sign_up');
  }

  /**
   * Check if there are validation errors.
   */
  async hasErrors(): Promise<boolean> {
    return await this.errorMessages.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Get all error messages.
   */
  async getErrorMessages(): Promise<string[]> {
    if (await this.hasErrors()) {
      return await this.errorMessages.allTextContents();
    }
    return [];
  }

  /**
   * Navigate to sign in page.
   */
  async goToSignIn(): Promise<void> {
    await this.signInLink.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Register a user and confirm their email via mailpit.
   * This completes the full registration flow.
   */
  async registerAndConfirm(name: string, email: string, password: string): Promise<boolean> {
    await this.register(name, email, password);

    // Confirm email via mailpit
    const confirmed = await confirmEmail(this.page, email);
    return confirmed;
  }
}
