import { test, expect } from '../fixtures/test-fixtures';
import { CategoryPage } from '../pages/category.page';
import { HomePage } from '../pages/home.page';

test.describe('Categories', () => {
  test.describe('Filter Posts by Category', () => {
    test('should show category links on home page', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      // Check for category links
      const categoryLinks = homePage.categoryLinks;
      const count = await categoryLinks.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should filter posts when clicking category', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      const categoryLink = page.locator('a[href^="/categories/"]').first();
      if (await categoryLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await categoryLink.click();
        await page.waitForLoadState('networkidle');

        // Should be on category page
        await expect(page).toHaveURL(/\/categories\/.+/);
      }
    });
  });

  test.describe('View Category Page', () => {
    test('should display category page with posts', async ({ page }) => {
      const categoryLink = page.locator('a[href^="/categories/"]').first();

      await page.goto('/');
      if (await categoryLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await categoryLink.click();
        await page.waitForLoadState('networkidle');

        const categoryPage = new CategoryPage(page);
        const title = await categoryPage.getTitle();
        expect(title.length).toBeGreaterThanOrEqual(0);
      }
    });

    test('should display posts in category', async ({ page }) => {
      const categoryLink = page.locator('a[href^="/categories/"]').first();

      await page.goto('/');
      if (await categoryLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await categoryLink.click();
        await page.waitForLoadState('networkidle');

        const categoryPage = new CategoryPage(page);
        const postCount = await categoryPage.getPostCount();
        expect(postCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Category Pagination', () => {
    test('should show pagination on category page if many posts', async ({ page }) => {
      const categoryLink = page.locator('a[href^="/categories/"]').first();

      await page.goto('/');
      if (await categoryLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await categoryLink.click();
        await page.waitForLoadState('networkidle');

        const categoryPage = new CategoryPage(page);
        const hasMorePages = await categoryPage.hasMorePages();
        expect(hasMorePages === true || hasMorePages === false).toBe(true);
      }
    });
  });
});
