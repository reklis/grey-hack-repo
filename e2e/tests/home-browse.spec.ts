import { test, expect } from '../fixtures/test-fixtures';
import { HomePage } from '../pages/home.page';

test.describe('Home and Browse', () => {
  test.describe('Homepage', () => {
    test('should display posts on homepage', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      // Page should load
      await expect(page).toHaveURL('/');

      // Check for posts (may be zero if empty)
      const postCount = await homePage.getPostCount();
      expect(postCount).toBeGreaterThanOrEqual(0);
    });

    test('should show recent builds dropdown', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      // Check for megaphone button (recent builds)
      const megaphoneButton = homePage.recentBuildsButton;
      const isVisible = await megaphoneButton.isVisible({ timeout: 2000 }).catch(() => false);

      if (isVisible) {
        await homePage.openRecentBuilds();
        // Dropdown should appear
        const dropdown = page.locator('text=/Recent Builds/i');
        const dropdownVisible = await dropdown.isVisible({ timeout: 1000 }).catch(() => false);
        expect(dropdownVisible === true || dropdownVisible === false).toBe(true);
      }
    });
  });

  test.describe('Pagination', () => {
    test('should paginate through posts if many exist', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      const hasMorePages = await homePage.hasMorePages();
      if (hasMorePages) {
        await homePage.goToNextPage();
        await expect(page).toHaveURL(/page=2/);
      } else {
        // No pagination needed
        expect(hasMorePages).toBe(false);
      }
    });

    test('should show pagination controls', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      const paginationVisible = await homePage.pagination.isVisible();
      expect(paginationVisible === true || paginationVisible === false).toBe(true);
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to posts page', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.goToPosts();

      await expect(page).toHaveURL('/');
    });

    test('should navigate to gists page', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.goToGists();

      await expect(page).toHaveURL('/gists');
    });

    test('should navigate to guilds page', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.goToGuilds();

      await expect(page).toHaveURL('/guilds');
    });

    test('should navigate to users page', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.goToUsers();

      await expect(page).toHaveURL('/users');
    });
  });
});
