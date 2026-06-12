import { test, expect } from '@playwright/test';
import { ADMIN, login } from './helpers';

test.describe('authentication', () => {
  test('redirects unauthenticated users to the login page', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('logs in with valid credentials and reaches the dashboard', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('rejects invalid credentials and stays on the login page', async ({ page }) => {
    await login(page, ADMIN.email, 'wrong-password');
    // The login form surfaces the API error ("Invalid credentials") as a toast.
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('signs out from the user menu', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/dashboard/);
    await page.getByTestId('user-menu-trigger').first().click();
    await page.getByTestId('logout-button').first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});
