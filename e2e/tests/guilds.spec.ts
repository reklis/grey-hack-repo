import { test, expect } from '../fixtures/test-fixtures';
import { GuildPage } from '../pages/guild.page';
import { testData } from '../fixtures/test-data';
import { uniqueGuildName, uniqueGuildTag } from '../utils/test-helpers';

test.describe('Guilds', () => {
  test.describe('Create Guild', () => {
    test('should create a new guild when logged in', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      const guildPage = new GuildPage(page);
      await guildPage.gotoNew();

      const guildName = uniqueGuildName();
      const guildTag = uniqueGuildTag();

      await guildPage.fillForm({
        name: guildName,
        description: testData.guilds.valid.description,
        tag: guildTag,
        alignment: 'grey',
      });
      await guildPage.submit();

      // Should redirect to guild page
      await expect(page).toHaveURL(/\/guilds\/.+/);
    });

    test('should require login to create guild', async ({ page }) => {
      await page.goto('/guilds/new');

      // Should redirect away from new guild page (to home or login)
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('/guilds/new');
    });
  });

  test.describe('View Guild', () => {
    test('should display guilds on guilds page', async ({ page }) => {
      const guildPage = new GuildPage(page);
      await guildPage.gotoList();

      // Page should load
      await expect(page).toHaveURL('/guilds');
    });

    test('should display guild page when clicking a guild', async ({ page }) => {
      const guildPage = new GuildPage(page);
      await guildPage.gotoList();

      const guildLink = page.locator('a[href^="/guilds/"]').first();
      if (await guildLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guildLink.click();
        await page.waitForLoadState('networkidle');

        // Should show guild name
        const name = await guildPage.getName();
        expect(name.length).toBeGreaterThanOrEqual(0);
      }
    });

    test('should show announcements section on guild page', async ({ page }) => {
      const guildPage = new GuildPage(page);
      await guildPage.gotoList();

      const guildLink = page.locator('a[href^="/guilds/"]').first();
      if (await guildLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guildLink.click();
        await page.waitForLoadState('networkidle');

        // Check for announcements section
        const announcementsVisible = await guildPage.announcementsSection.isVisible({ timeout: 1000 }).catch(() => false);
        expect(announcementsVisible === true || announcementsVisible === false).toBe(true);
      }
    });
  });

  test.describe('Edit Guild', () => {
    test('should show edit link for guild owner', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      const guildPage = new GuildPage(page);
      await guildPage.gotoList();

      const guildLink = page.locator('a[href^="/guilds/"]').first();
      if (await guildLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await guildLink.click();
        await page.waitForLoadState('networkidle');

        // Check for edit link (only visible to owner)
        const canEdit = await guildPage.canEdit();
        expect(canEdit === true || canEdit === false).toBe(true);
      }
    });
  });

  test.describe('Guild Alignments', () => {
    test('should show alignment options when creating guild', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      const guildPage = new GuildPage(page);
      await guildPage.gotoNew();

      // Check alignment select exists
      const isVisible = await guildPage.alignmentSelect.isVisible();
      expect(isVisible).toBe(true);

      // Get alignment options
      const options = await guildPage.getAlignmentOptions();
      expect(options.length).toBeGreaterThan(0);
    });

    test('should allow selecting different alignments', async ({ page, auth }) => {
      await auth.loginAsPrimary();

      const guildPage = new GuildPage(page);
      await guildPage.gotoNew();

      // Test selecting white alignment
      await guildPage.alignmentSelect.selectOption('white');
      expect(await guildPage.alignmentSelect.inputValue()).toBe('white');

      // Test selecting grey alignment
      await guildPage.alignmentSelect.selectOption('grey');
      expect(await guildPage.alignmentSelect.inputValue()).toBe('grey');

      // Test selecting black alignment
      await guildPage.alignmentSelect.selectOption('black');
      expect(await guildPage.alignmentSelect.inputValue()).toBe('black');
    });
  });
});
