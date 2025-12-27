import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { PaginationComponent } from '../components/pagination.component';

/**
 * Page object for user profile pages.
 */
export class UserProfilePage extends BasePage {
  /** User name display */
  readonly userName: Locator;

  /** User avatar */
  readonly avatar: Locator;

  /** User posts section */
  readonly postsSection: Locator;

  /** User gists section */
  readonly gistsSection: Locator;

  /** User guild info */
  readonly guildInfo: Locator;

  /** Posts tab/link */
  readonly postsTab: Locator;

  /** Gists tab/link */
  readonly gistsTab: Locator;

  /** Starred posts tab/link */
  readonly starredTab: Locator;

  /** Pagination component */
  readonly pagination: PaginationComponent;

  constructor(page: Page) {
    super(page);

    this.userName = page.locator('.text-3xl.font-semibold, h1');
    this.avatar = page.locator('img[alt*="avatar"]');
    this.postsSection = page.locator('[data-posts-section]');
    this.gistsSection = page.locator('[data-gists-section]');
    this.guildInfo = page.locator('[data-guild-info]');
    this.postsTab = page.locator('a[href*="/posts"], button:has-text("Posts")');
    this.gistsTab = page.locator('a[href*="/gists"], button:has-text("Gists")');
    this.starredTab = page.locator('a[href*="/starred"], button:has-text("Starred")');
    this.pagination = new PaginationComponent(page);
  }

  /**
   * Navigate to a user's profile by ID or username.
   */
  async goto(userIdOrUsername: string): Promise<void> {
    await this.navigateTo(`/users/${userIdOrUsername}`);
  }

  /**
   * Navigate to current user's posts (my posts).
   */
  async gotoMyPosts(): Promise<void> {
    await this.navigateTo('/myposts');
  }

  /**
   * Navigate to current user's gists (my gists).
   */
  async gotoMyGists(): Promise<void> {
    await this.navigateTo('/mygists');
  }

  /**
   * Navigate to users list.
   */
  async gotoUsersList(): Promise<void> {
    await this.navigateTo('/users');
  }

  /**
   * Get the displayed username.
   */
  async getUserName(): Promise<string> {
    const text = await this.userName.textContent();
    return text?.trim() || '';
  }

  /**
   * Get post count on the page.
   */
  async getPostCount(): Promise<number> {
    const posts = this.page.locator('.post-card, a[href^="/posts/"]');
    return await posts.count();
  }

  /**
   * Get gist count on the page.
   */
  async getGistCount(): Promise<number> {
    const gists = this.page.locator('.gist-card, a[href^="/gists/"]');
    return await gists.count();
  }

  /**
   * Click on a post.
   */
  async clickPost(index: number): Promise<void> {
    const posts = this.page.locator('a[href^="/posts/"]');
    await posts.nth(index).click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Click on a gist.
   */
  async clickGist(index: number): Promise<void> {
    const gists = this.page.locator('a[href^="/gists/"]');
    await gists.nth(index).click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Check if user is a guild member.
   */
  async hasGuild(): Promise<boolean> {
    return await this.guildInfo.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Get the user's guild name if any.
   */
  async getGuildName(): Promise<string | null> {
    if (await this.hasGuild()) {
      return await this.guildInfo.textContent();
    }
    return null;
  }

  /**
   * Navigate to next page of content.
   */
  async goToNextPage(): Promise<void> {
    await this.pagination.goToNext();
  }

  /**
   * Check if pagination is available.
   */
  async hasPagination(): Promise<boolean> {
    return await this.pagination.isVisible();
  }

  /**
   * Edit a post from the list.
   */
  async editPost(index: number): Promise<void> {
    const editLinks = this.page.locator('a[href*="/edit"]');
    await editLinks.nth(index).click();
    await this.waitHelpers.waitForTurbo();
  }

  /**
   * Delete a post from the list.
   */
  async deletePost(index: number): Promise<void> {
    const deleteButtons = this.page.locator('button:has-text("Delete"), a[data-turbo-method="delete"]');
    await deleteButtons.nth(index).click();
    await this.waitHelpers.waitForTurbo();
  }
}
