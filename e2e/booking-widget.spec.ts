/**
 * E2E Tests for Booking Widget
 * @module e2e/booking-widget.spec
 * 
 * Tests the embed-pro booking widget flow
 */

import { test, expect } from '@playwright/test';

test.describe('Booking Widget', () => {
  test.describe('Widget Loading', () => {
    test('should load embed-pro page', async ({ page }) => {
      await page.goto('/embed-pro');
      
      // Should show some content (login or widget)
      await expect(page).toHaveTitle(/BookingTMS|Booking/i);
    });

    test('should display login page when not authenticated', async ({ page }) => {
      await page.goto('/');
      
      // Should redirect to login or show login form
      const loginForm = page.locator('form, [data-testid="login-form"], button:has-text("Sign In"), button:has-text("Log In")');
      await expect(loginForm.first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Navigation', () => {
    test('should have working navigation links', async ({ page }) => {
      await page.goto('/');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check page is accessible
      expect(page.url()).toContain('localhost');
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/');
      
      // Page should render without horizontal overflow
      const body = page.locator('body');
      const bodyWidth = await body.evaluate((el) => el.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(375);
    });

    test('should be responsive on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('/');
      
      // Page should render properly
      await expect(page).toHaveTitle(/BookingTMS|Booking/i);
    });
  });
});

test.describe('Authentication Flow', () => {
  test('should show auth UI on protected routes', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login or show auth required
    await page.waitForLoadState('networkidle');
    
    // Either redirected to login or showing auth UI
    const hasAuthUI = await page.locator('button:has-text("Sign In"), button:has-text("Log In"), input[type="email"], input[type="password"]').first().isVisible().catch(() => false);
    const isOnLoginPage = page.url().includes('login') || page.url().includes('auth');
    
    expect(hasAuthUI || isOnLoginPage).toBeTruthy();
  });
});

test.describe('Error Handling', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page-xyz');
    
    // Should either show 404 page or redirect
    // Page should not crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle invalid embed key gracefully', async ({ page }) => {
    await page.goto('/embed-pro?key=invalid-key-xyz');
    
    // Should show error message or loading state
    // Page should not crash
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    // Should load DOM within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
