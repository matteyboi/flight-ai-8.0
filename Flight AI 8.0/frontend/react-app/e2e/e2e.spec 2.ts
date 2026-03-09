import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  const resp = await page.goto('/');
  expect(resp).not.toBeNull();
  expect(resp!.status()).toBeGreaterThanOrEqual(200);
  expect(resp!.status()).toBeLessThan(400);
  await expect(page.locator('body')).toBeVisible();
});
