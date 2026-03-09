import { test, expect } from '@playwright/test';

test('admin can delete progress entry and audit is recorded', async ({ page, request }) => {
  const ts = Date.now();
  const studentId = `e2e-del-${ts}`;

  // Create progress entry
  const post = await request.post('http://127.0.0.1:5051/progress', {
    data: {
      student_id: studentId,
      score: 88,
      data: { note: 'Entry to be deleted' }
    }
  });
  expect(post.ok()).toBeTruthy();

  // Fetch via admin API to obtain the entry id (use Basic auth)
  const authHeader = 'Basic ' + Buffer.from('admin:password').toString('base64');
  const listResp = await request.get(`http://127.0.0.1:5051/admin/progress?student_id=${encodeURIComponent(studentId)}`, { headers: { Authorization: authHeader } });
  expect(listResp.ok()).toBeTruthy();
  const listJson = await listResp.json();
  expect(listJson.entries && listJson.entries.length).toBeGreaterThan(0);
  const entryId = listJson.entries[0].id;

  // Open UI and delete via Admin card
  await page.goto('/');
  await page.click('button:has-text("Admin")');
  const adminCard = page.locator('div.card', { hasText: 'Admin Credentials' });
  await adminCard.locator('input').nth(0).fill('admin');
  await adminCard.locator('input').nth(1).fill('password');

  // Navigate to Delete card, fill id and click Delete
  const delCard = page.locator('div.card', { hasText: 'Delete Progress Entry' });
  await delCard.locator('input[placeholder="entry id"]').fill(String(entryId));
  // Accept browser confirm dialog and click Delete
  page.once('dialog', dialog => dialog.accept());
  await delCard.locator('button:has-text("Delete")').click();

  // Wait for confirmation text containing deleted id
  const pre = delCard.locator('pre');
  await expect(pre).toContainText(`"deleted": ${entryId}`);

  // Verify entry is gone via admin API
  const afterList = await request.get(`http://127.0.0.1:5051/admin/progress?student_id=${encodeURIComponent(studentId)}`, { headers: { Authorization: authHeader } });
  const afterJson = await afterList.json();
  expect(afterJson.entries.filter(e => e.id === entryId).length).toBe(0);

  // Verify audit contains delete for this entry id
  const auditResp = await request.get(`http://127.0.0.1:5051/admin/audit?limit=20`, { headers: { Authorization: authHeader } });
  expect(auditResp.ok()).toBeTruthy();
  const auditJson = await auditResp.json();
  const found = (auditJson.entries || []).find((a: any) => a.entry_id === entryId && a.action === 'delete');
  expect(found).toBeTruthy();
});
