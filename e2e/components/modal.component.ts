import { Page, Locator } from '@playwright/test';
import { WaitHelpers } from '../utils/wait-helpers';

/**
 * Component for interacting with modal dialogs.
 */
export class ModalComponent {
  readonly page: Page;
  readonly waitHelpers: WaitHelpers;

  constructor(page: Page) {
    this.page = page;
    this.waitHelpers = new WaitHelpers(page);
  }

  /**
   * Get the currently open modal.
   */
  getOpenModal(): Locator {
    return this.page.locator('dialog[open], [data-controller="modal"][data-modal-open="true"], .modal.modal-open');
  }

  /**
   * Check if any modal is open.
   */
  async isModalOpen(): Promise<boolean> {
    const modal = this.getOpenModal();
    return await modal.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Close the current modal.
   */
  async closeModal(): Promise<void> {
    // Try clicking close button
    const closeButton = this.getOpenModal().locator('button:has-text("Close"), button:has-text("Cancel"), [data-action*="close"]');
    if (await closeButton.isVisible({ timeout: 500 }).catch(() => false)) {
      await closeButton.click();
      await this.page.waitForTimeout(300);
      return;
    }

    // Try pressing Escape
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
  }

  /**
   * Click the confirm/action button in the modal.
   */
  async confirm(): Promise<void> {
    const modal = this.getOpenModal();
    const confirmButton = modal.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete"), a[data-turbo-method]');
    await confirmButton.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Click the cancel button in the modal.
   */
  async cancel(): Promise<void> {
    const modal = this.getOpenModal();
    const cancelButton = modal.locator('button:has-text("Cancel"), button:has-text("No")');
    await cancelButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Get the modal title.
   */
  async getTitle(): Promise<string> {
    const modal = this.getOpenModal();
    const title = modal.locator('h2, h3, [data-modal-header]');
    return await title.textContent() || '';
  }

  /**
   * Get the modal body text.
   */
  async getBodyText(): Promise<string> {
    const modal = this.getOpenModal();
    const body = modal.locator('[data-modal-body], .modal-body');
    return await body.textContent() || '';
  }

  /**
   * Fill a form field in the modal.
   */
  async fillField(fieldName: string, value: string): Promise<void> {
    const modal = this.getOpenModal();
    const field = modal.locator(`input[name*="${fieldName}"], textarea[name*="${fieldName}"]`);
    await field.fill(value);
  }

  /**
   * Wait for modal to open.
   */
  async waitForOpen(timeout = 5000): Promise<void> {
    await this.page.waitForSelector('dialog[open], .modal.modal-open', { timeout });
  }

  /**
   * Wait for modal to close.
   */
  async waitForClose(timeout = 5000): Promise<void> {
    await this.page.waitForSelector('dialog[open], .modal.modal-open', { state: 'detached', timeout });
  }
}
