import { Page, Locator } from '@playwright/test';
import { WaitHelpers } from '../utils/wait-helpers';

/**
 * Helper component for interacting with DaisyUI forms.
 * Provides utilities for filling various form field types.
 */
export class FormBuilderComponent {
  readonly page: Page;
  readonly waitHelpers: WaitHelpers;

  /** Form container (optional, can scope form interactions) */
  readonly form: Locator;

  constructor(page: Page, formSelector?: string) {
    this.page = page;
    this.waitHelpers = new WaitHelpers(page);
    this.form = formSelector ? page.locator(formSelector) : page.locator('form');
  }

  /**
   * Fill a text input by name.
   */
  async fillInput(name: string, value: string): Promise<void> {
    const input = this.form.locator(`input[name*="${name}"]`);
    await input.fill(value);
  }

  /**
   * Fill a textarea by name.
   */
  async fillTextarea(name: string, value: string): Promise<void> {
    const textarea = this.form.locator(`textarea[name*="${name}"]`);
    await textarea.fill(value);
  }

  /**
   * Select an option in a dropdown by name and value.
   */
  async selectOption(name: string, value: string): Promise<void> {
    const select = this.form.locator(`select[name*="${name}"]`);
    await select.selectOption(value);
  }

  /**
   * Select an option in a dropdown by visible text.
   */
  async selectByText(name: string, text: string): Promise<void> {
    const select = this.form.locator(`select[name*="${name}"]`);
    await select.selectOption({ label: text });
  }

  /**
   * Check a checkbox by name.
   */
  async checkCheckbox(name: string): Promise<void> {
    const checkbox = this.form.locator(`input[type="checkbox"][name*="${name}"]`);
    await checkbox.check();
  }

  /**
   * Uncheck a checkbox by name.
   */
  async uncheckCheckbox(name: string): Promise<void> {
    const checkbox = this.form.locator(`input[type="checkbox"][name*="${name}"]`);
    await checkbox.uncheck();
  }

  /**
   * Select a radio button by name and value.
   */
  async selectRadio(name: string, value: string): Promise<void> {
    const radio = this.form.locator(`input[type="radio"][name*="${name}"][value="${value}"]`);
    await radio.check();
  }

  /**
   * Fill a rich text editor (Trix).
   */
  async fillRichText(content: string): Promise<void> {
    const editor = this.form.locator('trix-editor, [contenteditable="true"]');
    await editor.fill(content);
  }

  /**
   * Upload a file to a file input.
   */
  async uploadFile(name: string, filePath: string): Promise<void> {
    const input = this.form.locator(`input[type="file"][name*="${name}"]`);
    await input.setInputFiles(filePath);
  }

  /**
   * Click the submit button.
   */
  async submit(): Promise<void> {
    const submitButton = this.form.locator('input[type="submit"], button[type="submit"]');
    await submitButton.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Get validation error for a field.
   */
  async getFieldError(name: string): Promise<string | null> {
    const errorMessage = this.form.locator(`[data-error-for="${name}"], .field-error, .text-red-400, .text-error`);
    if (await errorMessage.isVisible({ timeout: 500 }).catch(() => false)) {
      return await errorMessage.textContent();
    }
    return null;
  }

  /**
   * Check if form has any validation errors.
   */
  async hasErrors(): Promise<boolean> {
    const errors = this.form.locator('.field-error, .text-red-400, .text-error, [data-error]');
    return await errors.count() > 0;
  }

  /**
   * Get all validation errors.
   */
  async getAllErrors(): Promise<string[]> {
    const errors = this.form.locator('.field-error, .text-red-400, .text-error, [data-error]');
    return await errors.allTextContents();
  }

  /**
   * Clear all form fields.
   */
  async clearForm(): Promise<void> {
    const inputs = this.form.locator('input[type="text"], input[type="email"], input[type="password"], textarea');
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      await inputs.nth(i).clear();
    }
  }

  /**
   * Get the value of an input field.
   */
  async getInputValue(name: string): Promise<string> {
    const input = this.form.locator(`input[name*="${name}"], textarea[name*="${name}"]`);
    return await input.inputValue();
  }

  /**
   * Check if a checkbox is checked.
   */
  async isChecked(name: string): Promise<boolean> {
    const checkbox = this.form.locator(`input[type="checkbox"][name*="${name}"]`);
    return await checkbox.isChecked();
  }
}
