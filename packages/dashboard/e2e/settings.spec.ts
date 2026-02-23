import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test('displays threshold configuration form', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText('Settings')).toBeVisible();
    await expect(page.getByText('KPI Thresholds')).toBeVisible();
  });

  test('has save button', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText('Save Thresholds')).toBeVisible();
  });

  test('shows input fields for threshold values', async ({ page }) => {
    await page.goto('/settings');
    const inputs = page.locator('input[type="number"]');
    await expect(inputs.first()).toBeVisible();
  });
});
