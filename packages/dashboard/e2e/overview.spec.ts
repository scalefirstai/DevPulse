import { test, expect } from '@playwright/test';

test.describe('Overview Page', () => {
  test('loads with KPI cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Overview')).toBeVisible();
    await expect(page.locator('[class*="grid"]').first()).toBeVisible();
  });

  test('displays health radar chart', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Health Radar')).toBeVisible();
  });

  test('has team selector dropdown', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('select')).toBeVisible();
  });

  test('shows org health score', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Org Health Score')).toBeVisible();
  });
});
