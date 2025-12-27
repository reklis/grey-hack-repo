import { Page, Locator } from '@playwright/test';
import { WaitHelpers } from '../utils/wait-helpers';

/**
 * Component for interacting with the Stars Badge (StimulusReflex).
 * Used for starring/unstarring posts.
 */
export class StarsBadgeComponent {
  readonly page: Page;
  readonly waitHelpers: WaitHelpers;

  constructor(page: Page) {
    this.page = page;
    this.waitHelpers = new WaitHelpers(page);
  }

  /**
   * Get the star badge for a specific post or the first one on page.
   */
  private getBadge(postId?: string): Locator {
    if (postId) {
      return this.page.locator(`#star_badge_post_${postId}`);
    }
    return this.page.locator('[id^="star_badge_"]').first();
  }

  /**
   * Toggle the star state (star or unstar).
   */
  async toggleStar(postId?: string): Promise<void> {
    const badge = this.getBadge(postId);
    await badge.click();
    // Wait for StimulusReflex to complete the morph
    await this.waitHelpers.waitForReflex();
    // Additional wait for DOM update
    await this.page.waitForTimeout(200);
  }

  /**
   * Check if the post is currently starred.
   */
  async isStarred(postId?: string): Promise<boolean> {
    const badge = this.getBadge(postId);
    // Look for the filled star icon (stared state)
    const filledStar = badge.locator('[data-star-badge-target="staredIcon"]');
    const isHidden = await filledStar.isHidden({ timeout: 1000 }).catch(() => true);
    return !isHidden;
  }

  /**
   * Get the current star count.
   */
  async getStarCount(postId?: string): Promise<number> {
    const badge = this.getBadge(postId);
    const text = await badge.textContent();
    const match = text?.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  /**
   * Star a post (if not already starred).
   */
  async star(postId?: string): Promise<void> {
    const isStarred = await this.isStarred(postId);
    if (!isStarred) {
      await this.toggleStar(postId);
    }
  }

  /**
   * Unstar a post (if currently starred).
   */
  async unstar(postId?: string): Promise<void> {
    const isStarred = await this.isStarred(postId);
    if (isStarred) {
      await this.toggleStar(postId);
    }
  }

  /**
   * Check if the badge is visible on the page.
   */
  async isVisible(postId?: string): Promise<boolean> {
    const badge = this.getBadge(postId);
    return await badge.isVisible({ timeout: 1000 }).catch(() => false);
  }
}
