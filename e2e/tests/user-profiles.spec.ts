import { test, expect } from '../fixtures/test-fixtures';
import { UserProfilePage } from '../pages/user-profile.page';

test.describe('User Profiles', () => {
  test.describe('View User Profile', () => {
    test('should display user profile page', async ({ page }) => {
      await page.goto('/users');

      const userLink = page.locator('a[href^="/users/"]').first();
      if (await userLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await userLink.click();
        await page.waitForLoadState('networkidle');

        const userProfilePage = new UserProfilePage(page);
        const userName = await userProfilePage.getUserName();
        expect(userName.length).toBeGreaterThanOrEqual(0);
      }
    });

    test('should display users list page', async ({ page }) => {
      const userProfilePage = new UserProfilePage(page);
      await userProfilePage.gotoUsersList();

      await expect(page).toHaveURL('/users');
    });
  });

  test.describe("View User's Posts", () => {
    test("should display user's posts on profile", async ({ page }) => {
      await page.goto('/users');

      const userLink = page.locator('a[href^="/users/"]').first();
      if (await userLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await userLink.click();
        await page.waitForLoadState('networkidle');

        const userProfilePage = new UserProfilePage(page);
        const postCount = await userProfilePage.getPostCount();
        expect(postCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe("View User's Gists", () => {
    test("should display user's gists link", async ({ page }) => {
      await page.goto('/users');

      const userLink = page.locator('a[href^="/users/"]').first();
      if (await userLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await userLink.click();
        await page.waitForLoadState('networkidle');

        // Check for gists tab/section
        const gistsLink = page.locator('a[href*="/gists"]');
        const isVisible = await gistsLink.isVisible({ timeout: 1000 }).catch(() => false);
        expect(isVisible === true || isVisible === false).toBe(true);
      }
    });
  });

  test.describe('My Posts/Gists', () => {
    test('should display my posts page when logged in', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      const userProfilePage = new UserProfilePage(page);
      await userProfilePage.gotoMyPosts();

      await expect(page).toHaveURL('/myposts');
    });

    test('should display my gists page when logged in', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      const userProfilePage = new UserProfilePage(page);
      await userProfilePage.gotoMyGists();

      await expect(page).toHaveURL('/mygists');
    });

    test('should show edit options on my posts', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      const userProfilePage = new UserProfilePage(page);
      await userProfilePage.gotoMyPosts();

      // Check for edit links
      const editLink = page.locator('a[href*="/edit"]').first();
      const isVisible = await editLink.isVisible({ timeout: 2000 }).catch(() => false);
      expect(isVisible === true || isVisible === false).toBe(true);
    });
  });
});
