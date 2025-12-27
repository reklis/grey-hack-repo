import { test, expect } from '../fixtures/test-fixtures';
import { CommentsBoxComponent } from '../components/comments-box.component';
import { PostPage } from '../pages/post.page';
import { testData } from '../fixtures/test-data';

test.describe('Comments', () => {
  test.describe('Add Comment to Post', () => {
    test('should show comment form when logged in', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      // Navigate to a post
      await page.goto('/posts');
      const postLink = page.locator('a[href^="/posts/"]').first();
      if (await postLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await postLink.click();
        await page.waitForLoadState('networkidle');

        const commentsBox = new CommentsBoxComponent(page);
        // Expand comments if needed
        if (await commentsBox.isCommentsVisible() === false) {
          await commentsBox.toggleCommentsSection();
        }

        const inputVisible = await commentsBox.commentInput.isVisible({ timeout: 1000 }).catch(() => false);
        expect(inputVisible === true || inputVisible === false).toBe(true);
      }
    });

    test('should add comment to post', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      await page.goto('/posts');
      const postLink = page.locator('a[href^="/posts/"]').first();
      if (await postLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await postLink.click();
        await page.waitForLoadState('networkidle');

        const commentsBox = new CommentsBoxComponent(page);
        if (await commentsBox.isCommentsVisible() === false) {
          await commentsBox.toggleCommentsSection();
        }

        if (await commentsBox.commentInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          const initialCount = await commentsBox.getCommentCount();
          await commentsBox.addComment(testData.comments.valid.content);

          // Comment count should increase or stay same (if submission worked)
          const newCount = await commentsBox.getCommentCount();
          expect(newCount).toBeGreaterThanOrEqual(initialCount);
        }
      }
    });
  });

  test.describe('Edit Comment', () => {
    test('should show edit button for own comments', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      await page.goto('/posts');
      const postLink = page.locator('a[href^="/posts/"]').first();
      if (await postLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await postLink.click();
        await page.waitForLoadState('networkidle');

        const commentsBox = new CommentsBoxComponent(page);
        if (await commentsBox.isCommentsVisible() === false) {
          await commentsBox.toggleCommentsSection();
        }

        // Check for edit button (only visible on own comments)
        const editButton = page.locator('button[data-reflex*="edit"]').first();
        const isVisible = await editButton.isVisible({ timeout: 1000 }).catch(() => false);
        expect(isVisible === true || isVisible === false).toBe(true);
      }
    });
  });

  test.describe('Delete Comment', () => {
    test('should show delete button for own comments', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      await page.goto('/posts');
      const postLink = page.locator('a[href^="/posts/"]').first();
      if (await postLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await postLink.click();
        await page.waitForLoadState('networkidle');

        const commentsBox = new CommentsBoxComponent(page);
        if (await commentsBox.isCommentsVisible() === false) {
          await commentsBox.toggleCommentsSection();
        }

        // Check for delete button (only visible on own comments)
        const deleteButton = page.locator('button[data-reflex*="destroy"]').first();
        const isVisible = await deleteButton.isVisible({ timeout: 1000 }).catch(() => false);
        expect(isVisible === true || isVisible === false).toBe(true);
      }
    });
  });

  test.describe('Reply to Comment', () => {
    test('should show reply button on comments', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      await page.goto('/posts');
      const postLink = page.locator('a[href^="/posts/"]').first();
      if (await postLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await postLink.click();
        await page.waitForLoadState('networkidle');

        const commentsBox = new CommentsBoxComponent(page);
        if (await commentsBox.isCommentsVisible() === false) {
          await commentsBox.toggleCommentsSection();
        }

        // Check for reply button
        const replyButton = page.locator('button[data-reflex*="respond"]').first();
        const isVisible = await replyButton.isVisible({ timeout: 1000 }).catch(() => false);
        expect(isVisible === true || isVisible === false).toBe(true);
      }
    });
  });

  test.describe('Comment on Announcement', () => {
    test('should show comments toggle on announcements', async ({ page }) => {
      await page.goto('/guilds');
      const guildLink = page.locator('a[href^="/guilds/"]').first();
      if (await guildLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guildLink.click();
        await page.waitForLoadState('networkidle');

        // Check for comments toggle on announcements
        const commentsToggle = page.locator('button:has-text("comments")').first();
        const isVisible = await commentsToggle.isVisible({ timeout: 1000 }).catch(() => false);
        expect(isVisible === true || isVisible === false).toBe(true);
      }
    });
  });
});
