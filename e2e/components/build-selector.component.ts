import { Page, Locator } from '@playwright/test';
import { WaitHelpers } from '../utils/wait-helpers';

/**
 * Component for interacting with the Build Selector.
 * Allows switching between different builds of a post.
 */
export class BuildSelectorComponent {
  readonly page: Page;
  readonly waitHelpers: WaitHelpers;

  /** Build selector container */
  readonly selector: Locator;

  constructor(page: Page) {
    this.page = page;
    this.waitHelpers = new WaitHelpers(page);
    this.selector = page.locator('#build-selector, [data-controller*="build-selector"]');
  }

  /**
   * Select a build by ID.
   */
  async selectBuild(buildId: string): Promise<void> {
    const button = this.selector.locator(`button[data-build_id="${buildId}"]`);
    await button.click();
    await this.waitHelpers.waitForReflex();
  }

  /**
   * Select a build by name.
   */
  async selectBuildByName(buildName: string): Promise<void> {
    const button = this.selector.locator(`button:has-text("${buildName}")`);
    await button.click();
    await this.waitHelpers.waitForReflex();
  }

  /**
   * Get the currently selected build ID.
   */
  async getSelectedBuildId(): Promise<string | null> {
    const selected = this.selector.locator('button.btn-primary');
    return await selected.getAttribute('data-build_id');
  }

  /**
   * Get all build names in the selector.
   */
  async getBuildNames(): Promise<string[]> {
    const buttons = this.selector.locator('button[data-reflex*="BuildSelectorReflex"]');
    const texts = await buttons.allTextContents();
    return texts.map(t => t.trim()).filter(t => t.length > 0);
  }

  /**
   * Get the count of available builds.
   */
  async getBuildCount(): Promise<number> {
    const buttons = this.selector.locator('button[data-reflex*="BuildSelectorReflex"]');
    return await buttons.count();
  }

  /**
   * Click the diff link for a build.
   */
  async clickDiffLink(buildId: string): Promise<void> {
    const diffLink = this.selector.locator(`a[href*="/builds/${buildId}/diff"]`);
    await diffLink.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Check if a build is published.
   */
  async isBuildPublished(buildName: string): Promise<boolean> {
    const buildRow = this.selector.locator(`tr:has-text("${buildName}")`);
    const publishedIndicator = buildRow.locator('text=/published/i');
    return await publishedIndicator.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Check if the build selector is visible.
   */
  async isVisible(): Promise<boolean> {
    return await this.selector.isVisible({ timeout: 1000 }).catch(() => false);
  }
}
