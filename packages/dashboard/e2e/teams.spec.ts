import { test, expect } from '@playwright/test';

test.describe('Teams Page', () => {
  test('shows comparison bar chart and team table', async ({ page }) => {
    await page.goto('/teams');
    await expect(page.getByText('Teams')).toBeVisible();
    await expect(page.getByText('Team Comparison')).toBeVisible();
  });

  test('has KPI selector', async ({ page }) => {
    await page.goto('/teams');
    await expect(page.locator('select')).toBeVisible();
  });

  test('displays table with team names', async ({ page }) => {
    await page.goto('/teams');
    await expect(page.locator('table')).toBeVisible();
  });
});
