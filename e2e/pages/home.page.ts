import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { PaginationComponent } from '../components/pagination.component';

/**
 * Page object for the home page (posts listing).
 */
export class HomePage extends BasePage {
  /** Posts container */
  readonly postsContainer: Locator;

  /** Individual post cards */
  readonly postCards: Locator;

  /** Category tabs/links */
  readonly categoryLinks: Locator;

  /** Recent builds dropdown button */
  readonly recentBuildsButton: Locator;

  /** Search input */
  readonly searchInput: Locator;

  /** Pagination component */
  readonly pagination: PaginationComponent;

  constructor(page: Page) {
    super(page);

    this.postsContainer = page.locator('.posts-container, main');
    // Post cards are inside turbo-frame#posts and link to /posts/
    this.postCards = page.locator('#posts a[href^="/posts/"]');
    this.categoryLinks = page.locator('a[href^="/categories/"]');
    this.recentBuildsButton = page.locator('button:has(svg.octicon-megaphone)');
    this.searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    this.pagination = new PaginationComponent(page);
  }

  /**
   * Navigate to the home page.
   */
  async goto(): Promise<void> {
    await this.navigateTo('/');
  }

  /**
   * Get the count of visible posts.
   */
  async getPostCount(): Promise<number> {
    return await this.postCards.count();
  }

  /**
   * Click on a post by index.
   */
  async clickPost(index: number): Promise<void> {
    await this.postCards.nth(index).click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Click on a post by title.
   */
  async clickPostByTitle(title: string): Promise<void> {
    const post = this.page.locator(`a:has-text("${title}")`);
    await post.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Click on a category link.
   */
  async selectCategory(categoryName: string): Promise<void> {
    const categoryLink = this.page.locator(`a[href^="/categories/"]:has-text("${categoryName}")`);
    await categoryLink.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Open the recent builds dropdown.
   */
  async openRecentBuilds(): Promise<void> {
    if (await this.recentBuildsButton.isVisible()) {
      await this.recentBuildsButton.click();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Search for posts.
   */
  async search(query: string): Promise<void> {
    if (await this.searchInput.isVisible()) {
      await this.searchInput.fill(query);
      await this.searchInput.press('Enter');
      await this.waitHelpers.waitForTurbo();
    }
  }

  /**
   * Get titles of all visible posts.
   */
  async getPostTitles(): Promise<string[]> {
    const titles: string[] = [];
    const count = await this.postCards.count();
    for (let i = 0; i < count; i++) {
      const text = await this.postCards.nth(i).textContent();
      if (text) titles.push(text.trim());
    }
    return titles;
  }

  /**
   * Check if the home page is empty (no posts).
   */
  async isEmpty(): Promise<boolean> {
    const count = await this.getPostCount();
    return count === 0;
  }

  /**
   * Go to next page of posts.
   */
  async goToNextPage(): Promise<void> {
    await this.pagination.goToNext();
  }

  /**
   * Check if there are more pages.
   */
  async hasMorePages(): Promise<boolean> {
    return await this.pagination.hasNextPage();
  }
}
