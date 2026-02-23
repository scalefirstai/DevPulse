import { test, expect } from '@playwright/test';

test.describe('Trends Page', () => {
  test('renders with KPI selector and range buttons', async ({ page }) => {
    await page.goto('/trends');
    await expect(page.getByText('Trends')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
    await expect(page.getByText('30d')).toBeVisible();
    await expect(page.getByText('60d')).toBeVisible();
    await expect(page.getByText('90d')).toBeVisible();
  });

  test('switches range when clicking range button', async ({ page }) => {
    await page.goto('/trends');
    const btn30 = page.getByText('30d');
    await btn30.click();
    await expect(btn30).toHaveClass(/bg-gray-700/);
  });

  test('switches KPI type via selector', async ({ page }) => {
    await page.goto('/trends');
    await page.locator('select').selectOption('defect_escape');
    await expect(page.locator('select')).toHaveValue('defect_escape');
  });
});
