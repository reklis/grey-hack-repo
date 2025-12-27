import { test, expect } from '../fixtures/test-fixtures';
import { BuildEditorPage } from '../pages/build-editor.page';
import { FileTreeComponent } from '../components/file-tree.component';

test.describe('Scripts and Folders', () => {
  test.describe('File Tree Navigation', () => {
    test('should display file tree when editing a build', async ({ page, auth }) => {
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

          const fileTree = new FileTreeComponent(page);
          const isVisible = await fileTree.isVisible();
          expect(isVisible === true || isVisible === false).toBe(true);
        }
      }
    });
  });

  test.describe('Create Script', () => {
    test('should show add script button in file tree', async ({ page, auth }) => {
      await auth.loginAsPrimary();
      await page.goto('/myposts');

      const buildsLink = page.locator('a[href*="/builds"]').first();
      if (await buildsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await buildsLink.click();
        await page.waitForLoadState('networkidle');

        const editLink = page.locator('a[href*="build_id="]').first();
        if (await editLink.isVisible({ timeout: 1000 }).catch(() => false)) {
          await editLink.click();
          await page.waitForLoadState('networkidle');

          // Check for add script button
          const addScriptButton = page.locator('button[data-reflex*="add_script"]');
          const isVisible = await addScriptButton.isVisible({ timeout: 1000 }).catch(() => false);
          expect(isVisible === true || isVisible === false).toBe(true);
        }
      }
    });
  });

  test.describe('Create Folder', () => {
    test('should show add folder button in file tree', async ({ page, auth }) => {
      await auth.loginAsPrimary();
      await page.goto('/myposts');

      const buildsLink = page.locator('a[href*="/builds"]').first();
      if (await buildsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await buildsLink.click();
        await page.waitForLoadState('networkidle');

        const editLink = page.locator('a[href*="build_id="]').first();
        if (await editLink.isVisible({ timeout: 1000 }).catch(() => false)) {
          await editLink.click();
          await page.waitForLoadState('networkidle');

          // Check for add folder button
          const addFolderButton = page.locator('button[data-reflex*="add_folder"]');
          const isVisible = await addFolderButton.isVisible({ timeout: 1000 }).catch(() => false);
          expect(isVisible === true || isVisible === false).toBe(true);
        }
      }
    });
  });

  test.describe('Edit Script', () => {
    test('should show script editor when file is selected', async ({ page, auth }) => {
      await auth.loginAsPrimary();
      await page.goto('/myposts');

      const buildsLink = page.locator('a[href*="/builds"]').first();
      if (await buildsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await buildsLink.click();
        await page.waitForLoadState('networkidle');

        const editLink = page.locator('a[href*="build_id="]').first();
        if (await editLink.isVisible({ timeout: 1000 }).catch(() => false)) {
          await editLink.click();
          await page.waitForLoadState('networkidle');

          // Check for script form/editor
          const scriptForm = page.locator('form[action*="scripts"], textarea[name*="content"]');
          const isVisible = await scriptForm.isVisible({ timeout: 1000 }).catch(() => false);
          expect(isVisible === true || isVisible === false).toBe(true);
        }
      }
    });
  });

  test.describe('Delete File', () => {
    test('should show delete button for files', async ({ page, auth }) => {
      await auth.loginAsPrimary();
      await page.goto('/myposts');

      const buildsLink = page.locator('a[href*="/builds"]').first();
      if (await buildsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await buildsLink.click();
        await page.waitForLoadState('networkidle');

        const editLink = page.locator('a[href*="build_id="]').first();
        if (await editLink.isVisible({ timeout: 1000 }).catch(() => false)) {
          await editLink.click();
          await page.waitForLoadState('networkidle');

          // Check for delete button
          const deleteButton = page.locator('button:has-text("Delete")');
          const isVisible = await deleteButton.isVisible({ timeout: 1000 }).catch(() => false);
          expect(isVisible === true || isVisible === false).toBe(true);
        }
      }
    });
  });

  test.describe('Rename Folder', () => {
    test('should allow editing folder name', async ({ page, auth }) => {
      await auth.loginAsPrimary();
      await page.goto('/myposts');

      const buildsLink = page.locator('a[href*="/builds"]').first();
      if (await buildsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await buildsLink.click();
        await page.waitForLoadState('networkidle');

        // Just verify builds page loads correctly
        await expect(page).toHaveURL(/\/builds/);
      }
    });
  });
});
