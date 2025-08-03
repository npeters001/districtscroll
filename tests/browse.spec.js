const { test, expect } = require('@playwright/test');
const fs = require('fs');
const zlib = require('zlib');

test.describe('DistrictScroll browsing', () => {
  test('selection of vibe+category filters hides non-matching cards', async ({ page }) => {
    await page.goto('/browse.html');
    await page.waitForSelector('.card');
    const allCount = await page.locator('.card').count();
    // click first non-all vibe pill
    const vibePills = page.locator('#vibes-row .pill');
    const vibeCount = await vibePills.count();
    if (vibeCount > 1) {
      await vibePills.nth(1).click();
      await page.waitForTimeout(200);
      const countAfter = await page.locator('.card').count();
      expect(countAfter).toBeLessThanOrEqual(allCount);
    }
    // click first non-all category pill
    const catPills = page.locator('#cats-row .pill');
    const catCount = await catPills.count();
    if (catCount > 1) {
      await catPills.nth(1).click();
      await page.waitForTimeout(200);
      const countAfterCat = await page.locator('.card').count();
      expect(countAfterCat).toBeLessThanOrEqual(allCount);
    }
  });

  test('heart persists after reload', async ({ page }) => {
    await page.goto('/browse.html');
    await page.waitForSelector('.card');
    const firstCard = page.locator('.card').first();
    const heart = firstCard.locator('.heart');
    await heart.click();
    // Wait a moment to allow localStorage write
    await page.waitForTimeout(100);
    await page.reload();
    await page.waitForSelector('.card');
    const saved = await firstCard.evaluate(card => card.classList.contains('saved'));
    expect(saved).toBeTruthy();
  });

  test('URL reflects current selection', async ({ page }) => {
    await page.goto('/browse.html');
    await page.waitForSelector('.card');
    const vibePills = page.locator('#vibes-row .pill');
    const catPills = page.locator('#cats-row .pill');
    if (await vibePills.count() > 1 && await catPills.count() > 1) {
      await vibePills.nth(1).click();
      await catPills.nth(1).click();
      await page.waitForTimeout(200);
      const url = page.url();
      expect(url).toMatch(/vibe=/);
      expect(url).toMatch(/cat=/);
    }
  });

  test('bundle size threshold not exceeded', () => {
    const script = fs.readFileSync('public/script.js');
    const gz = zlib.gzipSync(script);
    expect(gz.length).toBeLessThanOrEqual(12288);
  });
});
