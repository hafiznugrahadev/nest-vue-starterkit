import { test, expect } from '@playwright/test';
import { gotoHydrated } from './helpers';

test.describe('i18n', () => {
  test('switches the UI language to Indonesian and persists it', async ({ page }) => {
    await gotoHydrated(page, '/login');
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();

    await page.getByTestId('language-switcher').click();
    await page.getByRole('menuitem', { name: 'Indonesia' }).click();

    await expect(page.getByRole('heading', { name: 'Masuk' })).toBeVisible();

    // persists across a full reload via the i18n_locale cookie
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Masuk' })).toBeVisible();
  });
});
