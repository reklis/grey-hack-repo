import { Page, Locator } from '@playwright/test';
import { WaitHelpers } from '../utils/wait-helpers';

/**
 * Component for interacting with pagination controls.
 */
export class PaginationComponent {
  readonly page: Page;
  readonly waitHelpers: WaitHelpers;

  /** Pagination container */
  readonly container: Locator;

  constructor(page: Page) {
    this.page = page;
    this.waitHelpers = new WaitHelpers(page);
    this.container = page.locator('nav[aria-label*="pagination"], .pagination, [data-controller="pagination"]');
  }

  /**
   * Go to the next page.
   */
  async goToNext(): Promise<void> {
    const nextLink = this.container.locator('a:has-text("Next"), a[rel="next"]');
    if (await nextLink.isVisible()) {
      await nextLink.click();
      await this.waitHelpers.waitForTurbo();
    }
  }

  /**
   * Go to the previous page.
   */
  async goToPrevious(): Promise<void> {
    const prevLink = this.container.locator('a:has-text("Previous"), a:has-text("Prev"), a[rel="prev"]');
    if (await prevLink.isVisible()) {
      await prevLink.click();
      await this.waitHelpers.waitForTurbo();
    }
  }

  /**
   * Go to a specific page number.
   */
  async goToPage(pageNumber: number): Promise<void> {
    const pageLink = this.container.locator(`a:has-text("${pageNumber}")`);
    if (await pageLink.isVisible()) {
      await pageLink.click();
      await this.waitHelpers.waitForTurbo();
    }
  }

  /**
   * Get the current page number.
   */
  async getCurrentPage(): Promise<number> {
    const currentPage = this.container.locator('[aria-current="page"], .active');
    const text = await currentPage.textContent();
    return text ? parseInt(text, 10) : 1;
  }

  /**
   * Check if there is a next page.
   */
  async hasNextPage(): Promise<boolean> {
    const nextLink = this.container.locator('a:has-text("Next"), a[rel="next"]');
    return await nextLink.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Check if there is a previous page.
   */
  async hasPreviousPage(): Promise<boolean> {
    const prevLink = this.container.locator('a:has-text("Previous"), a:has-text("Prev"), a[rel="prev"]');
    return await prevLink.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Get total number of pages if available.
   */
  async getTotalPages(): Promise<number | null> {
    const pageLinks = this.container.locator('a[href*="page="]');
    const count = await pageLinks.count();
    if (count === 0) return null;

    let maxPage = 1;
    for (let i = 0; i < count; i++) {
      const href = await pageLinks.nth(i).getAttribute('href');
      const match = href?.match(/page=(\d+)/);
      if (match) {
        const pageNum = parseInt(match[1], 10);
        if (pageNum > maxPage) maxPage = pageNum;
      }
    }
    return maxPage;
  }

  /**
   * Check if pagination is visible.
   */
  async isVisible(): Promise<boolean> {
    return await this.container.isVisible({ timeout: 1000 }).catch(() => false);
  }
}
