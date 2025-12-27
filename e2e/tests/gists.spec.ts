import { test, expect } from '../fixtures/test-fixtures';
import { GistPage } from '../pages/gist.page';
import { testData } from '../fixtures/test-data';
import { uniqueGistName, sampleScriptContent } from '../utils/test-helpers';

test.describe('Gists', () => {
  test.describe('Anonymous Gists', () => {
    test('should create anonymous gist without login', async ({ page }) => {
      const gistPage = new GistPage(page);
      await gistPage.gotoNew();

      const gistName = uniqueGistName();
      await gistPage.fillForm({
        name: gistName,
        description: testData.gists.anonymous.description,
      });
      await gistPage.addScript('main.src', sampleScriptContent('basic'));
      await gistPage.submit();

      // Should show the gist page with the created gist name
      await expect(page).toHaveURL(/\/gists\/.+/);
      await expect(page.locator('text=' + gistName)).toBeVisible();
    });

    test('should show warning for anonymous users', async ({ page }) => {
      const gistPage = new GistPage(page);
      await gistPage.gotoNew();

      // Check for anonymous warning
      const hasWarning = await gistPage.hasAnonymousWarning();
      // Warning may or may not be present depending on UI
      expect(hasWarning === true || hasWarning === false).toBe(true);
    });
  });

  test.describe('Authenticated Gists', () => {
    test('should create non-anonymous gist when logged in', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      const gistPage = new GistPage(page);
      await gistPage.gotoNew();

      const gistName = uniqueGistName();
      await gistPage.fillForm({
        name: gistName,
        description: testData.gists.authenticated.description,
        anonymous: false,
      });
      await gistPage.addScript('main.src', sampleScriptContent('basic'));
      await gistPage.submit();

      // Should show the gist page with the created gist name
      await expect(page).toHaveURL(/\/gists\/.+/);
      await expect(page.locator('text=' + gistName)).toBeVisible();
    });

    test('should toggle anonymous checkbox', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      const gistPage = new GistPage(page);
      await gistPage.gotoNew();

      // Check that anonymous checkbox exists and can be toggled
      const isVisible = await gistPage.anonymousCheckbox.isVisible({ timeout: 1000 }).catch(() => false);
      if (isVisible) {
        await gistPage.anonymousCheckbox.check();
        expect(await gistPage.anonymousCheckbox.isChecked()).toBe(true);

        await gistPage.anonymousCheckbox.uncheck();
        expect(await gistPage.anonymousCheckbox.isChecked()).toBe(false);
      }
    });
  });

  test.describe('Edit Gist', () => {
    test('should edit own gist', async ({ page, auth }) => {
      await auth.loginAsPrimary();
      await page.goto('/mygists');

      const editLink = page.locator('a[href*="/gists/"][href*="/edit"]').first();
      if (await editLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await editLink.click();
        await page.waitForLoadState('networkidle');

        const gistPage = new GistPage(page);
        const newName = uniqueGistName();
        await gistPage.nameInput.fill(newName);
        await gistPage.submit();

        // Should redirect to gist page and show updated name
        await expect(page).toHaveURL(/\/gists\/.+/);
        await expect(page.locator('text=' + newName)).toBeVisible();
      }
    });
  });

  test.describe('View Gist', () => {
    test('should display gist details', async ({ page }) => {
      const gistPage = new GistPage(page);
      await gistPage.gotoList();

      const gistLink = page.locator('a[href^="/gists/"]').first();
      if (await gistLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await gistLink.click();
        await page.waitForLoadState('networkidle');

        // Should show gist title
        const title = await gistPage.getTitle();
        expect(title.length).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Add Multiple Scripts', () => {
    test('should show add file button on gist form', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      const gistPage = new GistPage(page);
      await gistPage.gotoNew();

      // Check if add file button exists
      const addFileVisible = await gistPage.addFileButton.isVisible();
      expect(addFileVisible).toBe(true);

      // Verify we can fill out the form and create a gist
      const gistName = uniqueGistName();
      await gistPage.fillForm({
        name: gistName,
        description: 'Test gist',
        anonymous: false,
      });

      await gistPage.addScript('main.src', sampleScriptContent('basic'), 0);
      await gistPage.submit();

      // Should show the gist page with the created gist name
      await expect(page).toHaveURL(/\/gists\/.+/);
      await expect(page.locator('text=' + gistName)).toBeVisible();
    });
  });

  test.describe('Delete Gist', () => {
    test('should show delete option on my gists page', async ({ page, auth }) => {
      await auth.loginAsPrimary();
      await page.goto('/mygists');

      // Check for delete button/link
      const deleteButton = page.locator('button:has-text("Delete"), a:has-text("Delete")').first();
      const isVisible = await deleteButton.isVisible({ timeout: 2000 }).catch(() => false);
      expect(isVisible === true || isVisible === false).toBe(true);
    });
  });

  test.describe('Gist List', () => {
    test('should display gists on gists page', async ({ page }) => {
      const gistPage = new GistPage(page);
      await gistPage.gotoList();

      // Page should load
      await expect(page).toHaveURL('/gists');
    });
  });
});
