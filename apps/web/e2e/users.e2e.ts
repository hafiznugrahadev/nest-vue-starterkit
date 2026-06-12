import { test, expect } from '@playwright/test';
import {
  API_BASE,
  SUPER_ADMIN,
  apiToken,
  deleteUserByEmail,
  login,
  waitForHydration,
} from './helpers';

test.describe('users (super admin)', () => {
  test('lists seed users in the table', async ({ page }) => {
    await login(page, SUPER_ADMIN.email, SUPER_ADMIN.password);
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto('/users');
    await waitForHydration(page);
    await expect(page.getByText('admin@starterkit.test', { exact: true })).toBeVisible();
  });

  test('creates and deletes a user via the modal', async ({ page, request }) => {
    const email = `e2e-user-${Date.now()}@starterkit.test`;
    try {
      await login(page, SUPER_ADMIN.email, SUPER_ADMIN.password);
      await expect(page).toHaveURL(/\/dashboard/);
      await page.goto('/users');
      await waitForHydration(page);

      await page.getByRole('button', { name: /add user/i }).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByText('New user')).toBeVisible();
      await dialog.getByPlaceholder('jane@starterkit.test').fill(email);
      await dialog.getByPlaceholder('Jane Doe').fill('E2E User');
      await dialog.getByPlaceholder('••••••••').fill('e2e-pass-123');

      // Roles are required (min 1) — pick "User" from the multi-select popover,
      // then click the dialog title to dismiss the popover without closing the modal.
      await dialog.getByRole('button', { name: /select\.\.\./i }).click();
      await page.getByRole('button', { name: 'User', exact: true }).click();
      await dialog.getByText('New user').click();

      await dialog.getByRole('button', { name: /create user/i }).click();

      await page.getByPlaceholder('Search users…').fill(email);
      await expect(page.getByText(email)).toBeVisible();

      await page.getByRole('button', { name: 'Delete' }).first().click();
      const confirm = page.getByRole('dialog');
      await expect(confirm.getByText(/delete user/i)).toBeVisible();
      await confirm.getByRole('button', { name: /^delete$/i }).click();
      await expect(page.getByText(email)).toHaveCount(0);
    } finally {
      await deleteUserByEmail(request, email);
    }
  });

  test('edits a user via the modal', async ({ page, request }) => {
    const email = `e2e-edit-${Date.now()}@starterkit.test`;
    const token = await apiToken(request, SUPER_ADMIN.email, SUPER_ADMIN.password);
    await request.post(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { email, name: 'Edit Target', password: 'e2e-pass-123', roles: ['USER'] },
    });
    try {
      await login(page, SUPER_ADMIN.email, SUPER_ADMIN.password);
      await expect(page).toHaveURL(/\/dashboard/);
      await page.goto('/users');
      await waitForHydration(page);

      await page.getByPlaceholder('Search users…').fill(email);
      await expect(page.getByText(email, { exact: true })).toBeVisible();

      await page.getByRole('button', { name: 'Edit' }).first().click();
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByText('Edit user')).toBeVisible();
      await dialog.getByPlaceholder('Jane Doe').fill('Edited Name');
      await dialog.getByRole('button', { name: /save changes/i }).click();

      await expect(page.getByText('Edited Name', { exact: true })).toBeVisible();
    } finally {
      await deleteUserByEmail(request, email);
    }
  });

  test('filters the table by role tags (multi-select, server-side)', async ({ page }) => {
    await login(page, SUPER_ADMIN.email, SUPER_ADMIN.password);
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto('/users');
    await waitForHydration(page);

    const table = page.getByRole('table');
    await expect(table.getByText('user@starterkit.test', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Super Admin', exact: true }).click();
    await page.getByRole('button', { name: 'Admin', exact: true }).click();
    await expect(table.getByText('superadmin@starterkit.test', { exact: true })).toBeVisible();
    await expect(table.getByText('admin@starterkit.test', { exact: true })).toBeVisible();
    await expect(page.getByText('user@starterkit.test', { exact: true })).toHaveCount(0);

    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect(table.getByText('user@starterkit.test', { exact: true })).toBeVisible();
  });
});
