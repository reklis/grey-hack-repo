import { Page, Locator } from '@playwright/test';
import { WaitHelpers } from '../utils/wait-helpers';

/**
 * Component for interacting with the Comments Box.
 * Handles adding, editing, deleting, and replying to comments.
 */
export class CommentsBoxComponent {
  readonly page: Page;
  readonly waitHelpers: WaitHelpers;

  /** Comment input textarea */
  readonly commentInput: Locator;

  /** Create comment button */
  readonly submitButton: Locator;

  /** List of comments */
  readonly commentsList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.waitHelpers = new WaitHelpers(page);

    this.commentInput = page.locator('textarea[name="comment[content]"]');
    this.submitButton = page.locator('[data-action*="comments--form--component#create"], button:has-text("Create Comment")');
    this.commentsList = page.locator('[id^="comment_"]');
  }

  /**
   * Add a new comment.
   */
  async addComment(content: string): Promise<void> {
    await this.commentInput.fill(content);
    await this.submitButton.click();
    await this.waitHelpers.waitForReflex();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the number of comments.
   */
  async getCommentCount(): Promise<number> {
    return await this.commentsList.count();
  }

  /**
   * Get comment element by ID.
   */
  getComment(commentId: string): Locator {
    return this.page.locator(`#comment_${commentId}`);
  }

  /**
   * Edit an existing comment.
   */
  async editComment(commentId: string, newContent: string): Promise<void> {
    // Click edit button
    const editButton = this.page.locator(
      `button[data-reflex="click->Comments::Form::ComponentReflex#edit"][data-comment-id="${commentId}"]`
    );
    await editButton.click();
    await this.waitHelpers.waitForReflex();

    // Fill new content
    await this.commentInput.fill(newContent);

    // Click update button
    const updateButton = this.page.locator('[data-action*="comments--form--component#update"]');
    await updateButton.click();
    await this.waitHelpers.waitForReflex();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Delete a comment.
   */
  async deleteComment(commentId: string): Promise<void> {
    const deleteButton = this.page.locator(
      `button[data-reflex="click->Comments::Form::ComponentReflex#destroy"][data-comment-id="${commentId}"]`
    );
    await deleteButton.click();
    await this.waitHelpers.waitForReflex();
  }

  /**
   * Reply to a comment.
   */
  async replyToComment(commentId: string, replyContent: string): Promise<void> {
    // Click reply button
    const replyButton = this.page.locator(
      `button[data-reflex="click->Comments::Form::ComponentReflex#respond"][data-comment-id="${commentId}"]`
    );
    await replyButton.click();
    await this.waitHelpers.waitForReflex();

    // Fill reply content
    await this.commentInput.fill(replyContent);

    // Submit reply
    await this.submitButton.click();
    await this.waitHelpers.waitForReflex();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Toggle comments section visibility.
   */
  async toggleCommentsSection(): Promise<void> {
    const toggleButton = this.page.locator('button:has-text("comments")');
    await toggleButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Check if comments section is visible.
   */
  async isCommentsVisible(): Promise<boolean> {
    return await this.commentInput.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Get text content of a specific comment.
   */
  async getCommentText(commentId: string): Promise<string> {
    const comment = this.getComment(commentId);
    return await comment.textContent() || '';
  }
}
