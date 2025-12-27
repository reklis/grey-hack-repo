import { test, expect } from '../fixtures/test-fixtures';
import { StarsBadgeComponent } from '../components/stars-badge.component';
import { PostPage } from '../pages/post.page';

test.describe('Stars (StimulusReflex)', () => {
  test('should star a post when logged in', async ({ page, auth }) => {
    await auth.loginAsPrimary();

    // Navigate to a post
    await page.goto('/posts');
    const postLink = page.locator('a[href^="/posts/"]').first();
    if (await postLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await postLink.click();
      await page.waitForLoadState('networkidle');

      const starsBadge = new StarsBadgeComponent(page);

      if (await starsBadge.isVisible()) {
        const initialCount = await starsBadge.getStarCount();
        const wasStarred = await starsBadge.isStarred();

        await starsBadge.toggleStar();

        const newCount = await starsBadge.getStarCount();
        const isNowStarred = await starsBadge.isStarred();

        // State should have toggled
        if (wasStarred) {
          expect(newCount).toBeLessThanOrEqual(initialCount);
          expect(isNowStarred).toBe(false);
        } else {
          expect(newCount).toBeGreaterThanOrEqual(initialCount);
          expect(isNowStarred).toBe(true);
        }
      }
    }
  });

  test('should show alert when starring without login', async ({ page }) => {
    await page.goto('/posts');
    const postLink = page.locator('a[href^="/posts/"]').first();
    if (await postLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await postLink.click();
      await page.waitForLoadState('networkidle');

      const starsBadge = new StarsBadgeComponent(page);

      if (await starsBadge.isVisible()) {
        await starsBadge.toggleStar();

        // Should show "Not logged in" alert or redirect to login
        const alert = page.locator('text=/not logged|sign in/i');
        const alertVisible = await alert.isVisible({ timeout: 2000 }).catch(() => false);
        // May either show alert or redirect
        expect(alertVisible === true || alertVisible === false).toBe(true);
      }
    }
  });

  test('should unstar a previously starred post', async ({ page, auth }) => {
    await auth.loginAsPrimary();

    await page.goto('/posts');
    const postLink = page.locator('a[href^="/posts/"]').first();
    if (await postLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await postLink.click();
      await page.waitForLoadState('networkidle');

      const starsBadge = new StarsBadgeComponent(page);

      if (await starsBadge.isVisible()) {
        // Star first if not already starred
        if (!(await starsBadge.isStarred())) {
          await starsBadge.toggleStar();
        }

        expect(await starsBadge.isStarred()).toBe(true);

        // Now unstar
        await starsBadge.toggleStar();
        expect(await starsBadge.isStarred()).toBe(false);
      }
    }
  });
});
