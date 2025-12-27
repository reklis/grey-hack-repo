import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page object for the compressor utility page.
 */
export class CompressorPage extends BasePage {
  /** Compress section */
  readonly compressSection: Locator;

  /** Decompress section */
  readonly decompressSection: Locator;

  /** Compress input */
  readonly compressInput: Locator;

  /** Compress output */
  readonly compressOutput: Locator;

  /** Compress button */
  readonly compressButton: Locator;

  /** Decompress input */
  readonly decompressInput: Locator;

  /** Decompress output */
  readonly decompressOutput: Locator;

  /** Decompress button */
  readonly decompressButton: Locator;

  constructor(page: Page) {
    super(page);

    // The page has two encoder controllers
    this.compressSection = page.locator('[data-controller="encoder"]').first();
    this.decompressSection = page.locator('[data-controller="encoder"]').nth(1);

    this.compressInput = this.compressSection.locator('textarea[data-encoder-target="string"]');
    this.compressOutput = this.compressSection.locator('textarea[data-encoder-target="result"]');
    this.compressButton = this.compressSection.locator('button:has-text("compress")');

    this.decompressInput = this.decompressSection.locator('textarea[data-encoder-target="string"]');
    this.decompressOutput = this.decompressSection.locator('textarea[data-encoder-target="result"]');
    this.decompressButton = this.decompressSection.locator('button:has-text("decompress")');
  }

  /**
   * Navigate to the compressor page.
   */
  async goto(): Promise<void> {
    await this.navigateTo('/compressor');
  }

  /**
   * Compress a string.
   */
  async compress(input: string): Promise<string> {
    await this.compressInput.fill(input);
    await this.compressButton.click();
    await this.waitHelpers.waitForReflex();
    return await this.compressOutput.inputValue();
  }

  /**
   * Decompress a string.
   */
  async decompress(input: string): Promise<string> {
    await this.decompressInput.fill(input);
    await this.decompressButton.click();
    await this.waitHelpers.waitForReflex();
    return await this.decompressOutput.inputValue();
  }

  /**
   * Get the compressed output.
   */
  async getCompressedOutput(): Promise<string> {
    return await this.compressOutput.inputValue();
  }

  /**
   * Get the decompressed output.
   */
  async getDecompressedOutput(): Promise<string> {
    return await this.decompressOutput.inputValue();
  }

  /**
   * Clear the compress input.
   */
  async clearCompressInput(): Promise<void> {
    await this.compressInput.clear();
  }

  /**
   * Clear the decompress input.
   */
  async clearDecompressInput(): Promise<void> {
    await this.decompressInput.clear();
  }

  /**
   * Check if compress section is visible.
   */
  async isCompressSectionVisible(): Promise<boolean> {
    return await this.compressSection.isVisible();
  }

  /**
   * Check if decompress section is visible.
   */
  async isDecompressSectionVisible(): Promise<boolean> {
    return await this.decompressSection.isVisible();
  }

  /**
   * Check if output contains error.
   */
  async hasError(): Promise<boolean> {
    const compressOutput = await this.getCompressedOutput();
    const decompressOutput = await this.getDecompressedOutput();
    return compressOutput.includes('ERROR') || decompressOutput.includes('ERROR');
  }
}
