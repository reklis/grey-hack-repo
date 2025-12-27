import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { StarsBadgeComponent } from '../components/stars-badge.component';
import { CommentsBoxComponent } from '../components/comments-box.component';
import { BuildSelectorComponent } from '../components/build-selector.component';

/**
 * Page object for viewing a single post.
 */
export class PostPage extends BasePage {
  /** Post title */
  readonly title: Locator;

  /** Post summary */
  readonly summary: Locator;

  /** Post readme content */
  readonly readme: Locator;

  /** Category badge/link */
  readonly categoryBadge: Locator;

  /** Author link */
  readonly authorLink: Locator;

  /** Edit link */
  readonly editLink: Locator;

  /** Delete button */
  readonly deleteButton: Locator;

  /** Files section */
  readonly filesSection: Locator;

  /** Stars badge component */
  readonly starsBadge: StarsBadgeComponent;

  /** Comments box component */
  readonly commentsBox: CommentsBoxComponent;

  /** Build selector component */
  readonly buildSelector: BuildSelectorComponent;

  constructor(page: Page) {
    super(page);

    this.title = page.locator('.text-3xl.font-semibold').first();
    this.summary = page.locator('.text-beaver-300.text-center');
    this.readme = page.locator('.mt-20, .readme-content').first();
    this.categoryBadge = page.locator('.text-center.flex.justify-center a[href^="/categories/"]');
    this.authorLink = page.locator('a[href^="/users/"]').first();
    this.editLink = page.locator('a[href$="/edit"]');
    this.deleteButton = page.locator('button:has-text("Delete"), a:has-text("Delete")');
    this.filesSection = page.locator('#build-explorer, .text-center:has-text("Files")');

    this.starsBadge = new StarsBadgeComponent(page);
    this.commentsBox = new CommentsBoxComponent(page);
    this.buildSelector = new BuildSelectorComponent(page);
  }

  /**
   * Navigate to a post by slug.
   */
  async goto(slug: string): Promise<void> {
    await this.navigateTo(`/posts/${slug}`);
  }

  /**
   * Get the post title text.
   */
  async getTitle(): Promise<string> {
    const text = await this.title.textContent();
    return text?.trim() || '';
  }

  /**
   * Get the post summary text.
   */
  async getSummary(): Promise<string> {
    const text = await this.summary.textContent();
    return text?.trim() || '';
  }

  /**
   * Get the author name.
   */
  async getAuthorName(): Promise<string> {
    const text = await this.authorLink.textContent();
    return text?.trim() || '';
  }

  /**
   * Click to view author profile.
   */
  async viewAuthorProfile(): Promise<void> {
    await this.authorLink.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Star the post.
   */
  async star(): Promise<void> {
    await this.starsBadge.star();
  }

  /**
   * Unstar the post.
   */
  async unstar(): Promise<void> {
    await this.starsBadge.unstar();
  }

  /**
   * Check if the post is starred.
   */
  async isStarred(): Promise<boolean> {
    return await this.starsBadge.isStarred();
  }

  /**
   * Get star count.
   */
  async getStarCount(): Promise<number> {
    return await this.starsBadge.getStarCount();
  }

  /**
   * Add a comment.
   */
  async addComment(content: string): Promise<void> {
    await this.commentsBox.addComment(content);
  }

  /**
   * Navigate to edit page.
   */
  async goToEdit(): Promise<void> {
    await this.editLink.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Check if edit link is visible (user is owner).
   */
  async canEdit(): Promise<boolean> {
    return await this.editLink.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Navigate to builds page.
   */
  async goToBuilds(): Promise<void> {
    const buildsLink = this.page.locator('a[href*="/builds"]');
    await buildsLink.click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Check if the post is published.
   */
  async isPublished(): Promise<boolean> {
    const publishedBadge = this.page.locator('text=/published/i');
    return await publishedBadge.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Get the category name.
   */
  async getCategoryName(): Promise<string | null> {
    if (await this.categoryBadge.isVisible({ timeout: 1000 }).catch(() => false)) {
      return await this.categoryBadge.textContent();
    }
    return null;
  }
}
