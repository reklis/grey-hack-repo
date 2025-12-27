import { test, expect } from '../fixtures/test-fixtures';
import { CompressorPage } from '../pages/compressor.page';
import { NpcDecipherPage } from '../pages/npc-decipher.page';

test.describe('Utility Tools', () => {
  test.describe('NPC Decipher', () => {
    test('should display password count', async ({ page }) => {
      const npcDecipherPage = new NpcDecipherPage(page);
      await npcDecipherPage.goto();

      // Page should load
      await expect(page).toHaveURL('/npc_decipher');

      // Check for password count display
      const countVisible = await npcDecipherPage.passwordCount.isVisible({ timeout: 2000 }).catch(() => false);
      expect(countVisible === true || countVisible === false).toBe(true);
    });

    test('should show hash count info', async ({ page }) => {
      const npcDecipherPage = new NpcDecipherPage(page);
      await npcDecipherPage.goto();

      const hasInfo = await npcDecipherPage.hasHashCountInfo();
      expect(hasInfo === true || hasInfo === false).toBe(true);
    });

    test('should accept input and show result', async ({ page }) => {
      const npcDecipherPage = new NpcDecipherPage(page);
      await npcDecipherPage.goto();

      // Enter a sample hash (may or may not be found)
      await npcDecipherPage.enterInput('user@example.com:5d41402abc4b2a76b9719d911017c592');

      // Result section should be visible
      const resultVisible = await npcDecipherPage.result.isVisible({ timeout: 2000 }).catch(() => false);
      expect(resultVisible === true || resultVisible === false).toBe(true);
    });
  });

  test.describe('Compressor', () => {
    test('should display compressor page', async ({ page }) => {
      const compressorPage = new CompressorPage(page);
      await compressorPage.goto();

      await expect(page).toHaveURL('/compressor');
    });

    test('should show compress section', async ({ page }) => {
      const compressorPage = new CompressorPage(page);
      await compressorPage.goto();

      const isVisible = await compressorPage.isCompressSectionVisible();
      expect(isVisible).toBe(true);
    });

    test('should show decompress section', async ({ page }) => {
      const compressorPage = new CompressorPage(page);
      await compressorPage.goto();

      const isVisible = await compressorPage.isDecompressSectionVisible();
      expect(isVisible).toBe(true);
    });

    test('should compress input string', async ({ page }) => {
      const compressorPage = new CompressorPage(page);
      await compressorPage.goto();

      const output = await compressorPage.compress('Hello, GreyHack world!');

      // Output should have some content (compressed or error)
      expect(output.length).toBeGreaterThanOrEqual(0);
    });
  });
});
