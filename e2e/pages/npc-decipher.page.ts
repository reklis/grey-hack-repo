import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page object for the NPC decipher utility page.
 */
export class NpcDecipherPage extends BasePage {
  /** Page title */
  readonly title: Locator;

  /** Password count display */
  readonly passwordCount: Locator;

  /** Input textarea */
  readonly input: Locator;

  /** Result output */
  readonly result: Locator;

  /** Hash count info */
  readonly hashCountInfo: Locator;

  constructor(page: Page) {
    super(page);

    this.title = page.locator('h1, .text-3xl');
    this.passwordCount = page.locator('.text-3xl.font-bold');
    this.input = page.locator('textarea[data-decipher-target="input"]');
    this.result = page.locator('#result, [data-decipher-target="result"]');
    this.hashCountInfo = page.locator('text=/precomputed hashes/i');
  }

  /**
   * Navigate to the NPC decipher page.
   */
  async goto(): Promise<void> {
    await this.navigateTo('/npc_decipher');
  }

  /**
   * Get the password count displayed.
   */
  async getPasswordCount(): Promise<string> {
    const text = await this.passwordCount.textContent();
    return text?.trim() || '';
  }

  /**
   * Enter input for deciphering.
   * The input triggers a debounced reflex.
   */
  async enterInput(text: string): Promise<void> {
    await this.input.fill(text);
    // Wait for debounced reflex to trigger
    await this.waitHelpers.waitForDebouncedReflex(500);
  }

  /**
   * Get the result output.
   */
  async getResult(): Promise<string> {
    const text = await this.result.textContent();
    return text?.trim() || '';
  }

  /**
   * Clear the input.
   */
  async clearInput(): Promise<void> {
    await this.input.clear();
  }

  /**
   * Check if hash count info is displayed.
   */
  async hasHashCountInfo(): Promise<boolean> {
    return await this.hashCountInfo.isVisible();
  }

  /**
   * Decipher a hash and get result.
   */
  async decipher(hashInput: string): Promise<string> {
    await this.enterInput(hashInput);
    return await this.getResult();
  }

  /**
   * Check if result contains deciphered password.
   */
  async hasDecipheredResult(): Promise<boolean> {
    const result = await this.getResult();
    return result.length > 0 && !result.includes('not found');
  }

  /**
   * Get the page title.
   */
  async getTitle(): Promise<string> {
    const text = await this.title.textContent();
    return text?.trim() || '';
  }
}
