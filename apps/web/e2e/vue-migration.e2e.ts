import { test, expect } from '@playwright/test';
import { SUPER_ADMIN, login } from './helpers';

test.describe('vue migration smoke', () => {
  test('session survives a hard reload (refresh-cookie bootstrap)', async ({ page }) => {
    await login(page, SUPER_ADMIN.email, SUPER_ADMIN.password);
    await expect(page).toHaveURL(/\/dashboard/);
    await page.reload();
    // bootstrap() exchanges the httpOnly cookie BEFORE guards run — no bounce to /login
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('guest hitting /users is bounced to login with redirect, then lands back', async ({
    page,
  }) => {
    await page.goto('/users');
    await expect(page).toHaveURL(/\/login\?redirect=(%2F|\/)users/);
    await page.getByLabel('Email').fill(SUPER_ADMIN.email);
    await page.locator('#password').fill(SUPER_ADMIN.password);
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/\/users/);
  });

  test('authed user on /login is bounced to dashboard', async ({ page }) => {
    await login(page, SUPER_ADMIN.email, SUPER_ADMIN.password);
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto('/login');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('dark mode toggle persists across reload', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const wasDark = await html.evaluate((el) => el.classList.contains('dark'));
    await page.locator('header button').first().click(); // theme toggle in landing header
    await page.reload();
    const isDark = await html.evaluate((el) => el.classList.contains('dark'));
    expect(isDark).toBe(!wasDark);
  });
});
