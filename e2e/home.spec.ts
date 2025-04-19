import { test, expect } from '@playwright/test';

test.describe('Home page tests', () => {
  test('homepage should load properly', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Verify that the page has loaded
    await expect(page).toHaveTitle(/Abaya Elegance/);
    
    // Wait for the database connection to be established
    await expect(page.locator('text=Connected to Supabase')).toBeVisible({ timeout: 10000 });
  });

  test('navigation menu should have expected links', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Wait for navigation to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check for key navigation links
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /shop/i })).toBeVisible();
  });

  test('responsive design should work on mobile screens', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to the homepage
    await page.goto('/');
    
    // Menu should be collapsed on mobile
    const hamburgerMenu = page.locator('button[aria-label="Toggle menu"]');
    await expect(hamburgerMenu).toBeVisible();
    
    // Opening the menu should show navigation links
    await hamburgerMenu.click();
    await expect(page.locator('nav').getByRole('link', { name: /shop/i })).toBeVisible();
  });
}); 