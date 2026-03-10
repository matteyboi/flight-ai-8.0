import { test, expect } from '@playwright/test';
import fs from 'fs';

test('server CSV export and client CSV download contain created entry', async ({ page, request }) => {
  const ts = Date.now();
  const studentId = `e2e-csv-${ts}`;

  // Create progress entry
  const post = await request.post('http://127.0.0.1:5051/progress', {
    data: { student_id: studentId, flight_hours: 3, note: 'csv test' }
  });
  expect(post.ok()).toBeTruthy();
  // Wait for backend to commit entry
  await page.waitForTimeout(500);

  // Server CSV export via admin endpoint (Basic auth)
  const auth = 'Basic ' + Buffer.from('admin:password').toString('base64');
  const csvResp = await request.get(`http://127.0.0.1:5051/admin/progress.csv?student_id=${encodeURIComponent(studentId)}`, { headers: { Authorization: auth } });
  expect(csvResp.ok()).toBeTruthy();
  const csvText = await csvResp.text();
  expect(csvText).toContain(studentId);

  // Client-side CSV download via UI
  await page.goto('/');
  await page.click('[data-testid="admin-tab"]');
  const adminCard = page.locator('div.card', { hasText: 'Admin Credentials' });
  await adminCard.locator('input').nth(0).fill('admin');
  await adminCard.locator('input').nth(1).fill('password');

  // Set Student filter and fetch
  await page.fill('label:has-text("Student") + input', studentId);
  await page.click('button:has-text("Fetch")');
  await page.waitForSelector('table.data-table');

  // Trigger client export and capture download
  const viewCard = page.locator('div.card', { hasText: 'View Progress' });
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    viewCard.locator('button:has-text("Export CSV (client)")').click()
  ]);
  const dlPath = await download.path();
  const dlText = fs.readFileSync(dlPath!, 'utf8');
  expect(dlText).toContain(studentId);
});
