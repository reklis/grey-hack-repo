import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { PaginationComponent } from '../components/pagination.component';

/**
 * Page object for category pages.
 */
export class CategoryPage extends BasePage {
  /** Category title */
  readonly title: Locator;

  /** Category description */
  readonly description: Locator;

  /** Posts in category */
  readonly posts: Locator;

  /** Category icon */
  readonly icon: Locator;

  /** Pagination component */
  readonly pagination: PaginationComponent;

  constructor(page: Page) {
    super(page);

    this.title = page.locator('h1, .text-3xl');
    this.description = page.locator('.category-description, .text-beaver-300');
    this.posts = page.locator('.post-card, a[href^="/posts/"]');
    this.icon = page.locator('.category-icon, svg');
    this.pagination = new PaginationComponent(page);
  }

  /**
   * Navigate to a category by slug.
   */
  async goto(slug: string): Promise<void> {
    await this.navigateTo(`/categories/${slug}`);
  }

  /**
   * Get the category title.
   */
  async getTitle(): Promise<string> {
    const text = await this.title.textContent();
    return text?.trim() || '';
  }

  /**
   * Get the category description.
   */
  async getDescription(): Promise<string> {
    const text = await this.description.textContent();
    return text?.trim() || '';
  }

  /**
   * Get post count in the category.
   */
  async getPostCount(): Promise<number> {
    return await this.posts.count();
  }

  /**
   * Click on a post.
   */
  async clickPost(index: number): Promise<void> {
    await this.posts.nth(index).click();
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
   * Get all post titles in the category.
   */
  async getPostTitles(): Promise<string[]> {
    const titles: string[] = [];
    const count = await this.posts.count();
    for (let i = 0; i < count; i++) {
      const text = await this.posts.nth(i).textContent();
      if (text) titles.push(text.trim());
    }
    return titles;
  }

  /**
   * Check if category is empty.
   */
  async isEmpty(): Promise<boolean> {
    const count = await this.getPostCount();
    return count === 0;
  }

  /**
   * Navigate to next page.
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
