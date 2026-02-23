import { test, expect } from '@playwright/test';

test.describe('Onboarding Page', () => {
  test('shows welcome message and step indicators', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.getByText('Welcome to DevPulse')).toBeVisible();
  });

  test('has team creation form on first step', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.getByText('Create Your First Team')).toBeVisible();
    await expect(page.getByPlaceholder('e.g., Platform')).toBeVisible();
  });

  test('auto-generates slug from team name', async ({ page }) => {
    await page.goto('/onboarding');
    await page.getByPlaceholder('e.g., Platform').fill('My Team');
    await expect(page.getByPlaceholder('e.g., platform')).toHaveValue('my-team');
  });
});
