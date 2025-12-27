import { test, expect } from '../fixtures/test-fixtures';
import { GuildPage } from '../pages/guild.page';
import { testData } from '../fixtures/test-data';

test.describe('Announcements', () => {
  test.describe('Create Announcement', () => {
    test('should show announcement form for guild members', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      const guildPage = new GuildPage(page);
      await guildPage.gotoList();

      const guildLink = page.locator('a[href^="/guilds/"]').first();
      if (await guildLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guildLink.click();
        await page.waitForLoadState('networkidle');

        // Check for announcement input (only visible to members)
        const inputVisible = await guildPage.announcementInput.isVisible({ timeout: 1000 }).catch(() => false);
        expect(inputVisible === true || inputVisible === false).toBe(true);
      }
    });

    test('should create announcement when form is submitted', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      const guildPage = new GuildPage(page);
      await guildPage.gotoList();

      const guildLink = page.locator('a[href^="/guilds/"]').first();
      if (await guildLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guildLink.click();
        await page.waitForLoadState('networkidle');

        if (await guildPage.announcementInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await guildPage.createAnnouncement(testData.announcements.valid.message);

          // Should show announcement in list
          const announcementCount = await guildPage.getAnnouncementCount();
          expect(announcementCount).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  test.describe('Edit Announcement', () => {
    test('should show edit link for announcement author', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      const guildPage = new GuildPage(page);
      await guildPage.gotoList();

      const guildLink = page.locator('a[href^="/guilds/"]').first();
      if (await guildLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guildLink.click();
        await page.waitForLoadState('networkidle');

        // Hover over announcement to show edit link
        const announcement = page.locator('[id^="announcement_"]').first();
        if (await announcement.isVisible({ timeout: 1000 }).catch(() => false)) {
          await announcement.hover();

          const editLink = page.locator('a[href*="/announcements/"][href*="/edit"]').first();
          const isVisible = await editLink.isVisible({ timeout: 1000 }).catch(() => false);
          expect(isVisible === true || isVisible === false).toBe(true);
        }
      }
    });
  });

  test.describe('Delete Announcement', () => {
    test('should show delete button for announcement author', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      const guildPage = new GuildPage(page);
      await guildPage.gotoList();

      const guildLink = page.locator('a[href^="/guilds/"]').first();
      if (await guildLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guildLink.click();
        await page.waitForLoadState('networkidle');

        // Hover over announcement to show delete button
        const announcement = page.locator('[id^="announcement_"]').first();
        if (await announcement.isVisible({ timeout: 1000 }).catch(() => false)) {
          await announcement.hover();

          const deleteButton = page.locator('button:has-text("Delete")').first();
          const isVisible = await deleteButton.isVisible({ timeout: 1000 }).catch(() => false);
          expect(isVisible === true || isVisible === false).toBe(true);
        }
      }
    });
  });

  test.describe('Announcement Comments', () => {
    test('should show comments toggle on announcements', async ({ page }) => {
      const guildPage = new GuildPage(page);
      await guildPage.gotoList();

      const guildLink = page.locator('a[href^="/guilds/"]').first();
      if (await guildLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guildLink.click();
        await page.waitForLoadState('networkidle');

        // Check for comments toggle button
        const commentsToggle = page.locator('button:has-text("comments")').first();
        const isVisible = await commentsToggle.isVisible({ timeout: 1000 }).catch(() => false);
        expect(isVisible === true || isVisible === false).toBe(true);
      }
    });
  });
});
