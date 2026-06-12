import { test, expect } from '@playwright/test';
import { ADMIN, API_BASE, apiToken, login } from './helpers';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

async function patchMe(request: Parameters<typeof apiToken>[0], data: Record<string, unknown>) {
  const token = await apiToken(request, ADMIN.email, ADMIN.password);
  await request.patch(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  });
}

test.describe('profile', () => {
  test('edits the display name', async ({ page, request }) => {
    try {
      await login(page);
      await expect(page).toHaveURL(/\/dashboard/);
      await page.goto('/profile');

      // Personal Information card is always editable (no Edit toggle); wait for
      // the profile fetch to populate the form before typing over it.
      const nameInput = page.getByLabel('Full name');
      await expect(nameInput).toHaveValue('Admin');

      await nameInput.fill('Admin Edited');
      await page.getByRole('button', { name: /save changes/i }).click();

      // The new name shows up in the profile header card (and the sidebar user menu).
      await expect(page.getByText('Admin Edited').first()).toBeVisible();
    } finally {
      await patchMe(request, { name: 'Admin' });
    }
  });

  test('uploads an avatar', async ({ page, request }) => {
    await patchMe(request, { avatarUrl: '' });
    try {
      await login(page);
      await expect(page).toHaveURL(/\/dashboard/);
      await page.goto('/profile');
      await expect(page.getByLabel('Full name')).toHaveValue('Admin');

      await page.locator('input[type="file"]').setInputFiles({
        name: 'avatar.png',
        mimeType: 'image/png',
        buffer: PNG,
      });

      // Upload → PATCH /users/me succeeded (toast). The rendered <img> itself is
      // not asserted: the presigned URL host (RustFS) may not resolve from the
      // test browser, so verify the persisted avatarUrl via the API instead.
      await expect(page.getByText('Profile updated')).toBeVisible();
      const token = await apiToken(request, ADMIN.email, ADMIN.password);
      const me = await request.get(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect((await me.json()).data.avatarUrl).toBeTruthy();
    } finally {
      await patchMe(request, { avatarUrl: '' });
    }
  });
});
