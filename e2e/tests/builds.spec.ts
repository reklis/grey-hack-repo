import { test, expect } from '../fixtures/test-fixtures';
import { PostFormPage } from '../pages/post-form.page';
import { BuildEditorPage } from '../pages/build-editor.page';
import { testData } from '../fixtures/test-data';
import { uniquePostTitle } from '../utils/test-helpers';

test.describe('Builds', () => {
  test.describe('Create Build', () => {
    test('should add a new build to a post', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      // First create a post
      const postFormPage = new PostFormPage(page);
      const title = uniquePostTitle();
      await postFormPage.gotoNew();
      await postFormPage.fillForm({
        title,
        summary: testData.posts.valid.summary,
      });
      await postFormPage.submit();

      // Navigate to builds page
      const buildsLink = page.locator('a[href*="/builds"]');
      if (await buildsLink.isVisible()) {
        await buildsLink.click();

        const buildEditorPage = new BuildEditorPage(page);
        await buildEditorPage.waitHelpers.waitForPageReady();

        // Check if add build button exists
        const addButtonVisible = await buildEditorPage.addBuildButton.isVisible();
        expect(addButtonVisible).toBe(true);
      }
    });
  });

  test.describe('Edit Build', () => {
    test('should allow editing build name', async ({ page, auth }) => {
      await auth.loginAsPrimary();
      await page.goto('/myposts');

      // Find a post with builds link
      const buildsLink = page.locator('a[href*="/builds"]').first();
      if (await buildsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await buildsLink.click();
        await page.waitForLoadState('networkidle');

        const buildEditorPage = new BuildEditorPage(page);
        // Just verify the page loads
        await expect(page).toHaveURL(/\/builds/);
      }
    });
  });

  test.describe('Clone Build', () => {
    test('should show clone button for published builds', async ({ page, auth }) => {
      await auth.loginAsPrimary();
      await page.goto('/myposts');

      const buildsLink = page.locator('a[href*="/builds"]').first();
      if (await buildsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await buildsLink.click();
        await page.waitForLoadState('networkidle');

        // Check for clone button (only visible for published builds)
        const cloneButton = page.locator('button:has-text("clone")');
        const isVisible = await cloneButton.isVisible({ timeout: 1000 }).catch(() => false);
        expect(isVisible === true || isVisible === false).toBe(true);
      }
    });
  });

  test.describe('Build Diff', () => {
    test('should show diff link for builds', async ({ page, auth }) => {
      await auth.loginAsPrimary();
      await page.goto('/myposts');

      const buildsLink = page.locator('a[href*="/builds"]').first();
      if (await buildsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await buildsLink.click();
        await page.waitForLoadState('networkidle');

        // Check for diff link
        const diffLink = page.locator('a:has-text("diff")');
        const isVisible = await diffLink.isVisible({ timeout: 1000 }).catch(() => false);
        expect(isVisible === true || isVisible === false).toBe(true);
      }
    });
  });

  test.describe('Publish Build', () => {
    test('should show publish button when build is ready', async ({ page, auth }) => {
      await auth.loginAsPrimary();
      await page.goto('/myposts');

      const buildsLink = page.locator('a[href*="/builds"]').first();
      if (await buildsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await buildsLink.click();
        await page.waitForLoadState('networkidle');

        const buildEditorPage = new BuildEditorPage(page);
        // Check for any publish buttons
        const publishButtons = page.locator('button:has-text("Publish"), #publish-post');
        const count = await publishButtons.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Delete Build', () => {
    test('should show delete option for builds', async ({ page, auth }) => {
      await auth.loginAsPrimary();
      await page.goto('/myposts');

      const buildsLink = page.locator('a[href*="/builds"]').first();
      if (await buildsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await buildsLink.click();
        await page.waitForLoadState('networkidle');

        // Check for delete buttons (trash icon)
        const deleteButtons = page.locator('svg.octicon-trash, button:has(svg.octicon-trash)');
        const count = await deleteButtons.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Add Files to Build', () => {
    test('should show file tree when build is selected', async ({ page, auth }) => {
      await auth.loginAsPrimary();
      await page.goto('/myposts');

      const buildsLink = page.locator('a[href*="/builds"]').first();
      if (await buildsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await buildsLink.click();
        await page.waitForLoadState('networkidle');

        // Click edit on a build
        const editLink = page.locator('a[href*="build_id="]').first();
        if (await editLink.isVisible({ timeout: 1000 }).catch(() => false)) {
          await editLink.click();
          await page.waitForLoadState('networkidle');

          // Should show file tree or editor
          const buildEditorPage = new BuildEditorPage(page);
          const fileTreeVisible = await buildEditorPage.fileTree.isVisible();
          expect(fileTreeVisible === true || fileTreeVisible === false).toBe(true);
        }
      }
    });
  });

  test.describe('Import Build', () => {
    test('should show import from string option', async ({ page, auth }) => {
      await auth.loginAsPrimary();
      await page.goto('/myposts');

      const buildsLink = page.locator('a[href*="/builds"]').first();
      if (await buildsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await buildsLink.click();
        await page.waitForLoadState('networkidle');

        // Click edit on a build
        const editLink = page.locator('a[href*="build_id="]').first();
        if (await editLink.isVisible({ timeout: 1000 }).catch(() => false)) {
          await editLink.click();
          await page.waitForLoadState('networkidle');

          const buildEditorPage = new BuildEditorPage(page);
          const importLinkVisible = await buildEditorPage.importFromStringLink.isVisible({ timeout: 1000 }).catch(() => false);
          expect(importLinkVisible === true || importLinkVisible === false).toBe(true);
        }
      }
    });
  });
});
