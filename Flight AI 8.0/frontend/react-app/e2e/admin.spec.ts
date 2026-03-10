import { test, expect } from '@playwright/test';

test('admin lists created progress entry', async ({ page, request }) => {
  const ts = Date.now();
  const studentId = `e2e-${ts}`;

  // Create a progress entry via backend API
  const post = await request.post('http://127.0.0.1:5051/progress', {
    data: {
      student_id: studentId,
      score: 90,
      data: { note: 'E2E test entry' }
    }
  });
  expect(post.ok()).toBeTruthy();
  // Wait for backend to commit entry
  await page.waitForTimeout(500);

  // Open admin UI (webServer will have started preview)
  await page.goto('/');
  // Diagnostic: print navigation container HTML
  const navHtml = await page.locator('[data-testid="tab-navigation"]').innerHTML();
  console.log('Navigation container HTML:', navHtml);
  // Navigate to Admin tab
  await page.click('[data-testid="admin-tab"]');
  // Fill admin credentials (defaults in backend are admin/password)
  const adminCard = page.locator('div.card', { hasText: 'Admin Credentials' });
  await adminCard.locator('input').nth(0).fill('admin');
  await adminCard.locator('input').nth(1).fill('password');

  // Fetch progress
  await page.click('button:has-text("Fetch")');

  // Wait for table or row containing our student id
  await page.waitForSelector('table.data-table');
  const row = page.locator('table.data-table tbody tr', { hasText: studentId });
  await expect(row).toHaveCount(1);
});
