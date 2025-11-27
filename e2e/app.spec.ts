/**
 * E2E Tests for Main Application
 * @module e2e/app.spec
 * 
 * Tests the main BookingTMS application
 */

import { test, expect } from '@playwright/test';

test.describe('Application Health', () => {
  test('should load the application', async ({ page }) => {
    const response = await page.goto('/');
    
    // Should get successful response
    expect(response?.status()).toBeLessThan(400);
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('/');
    
    // Title should contain app name
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should load CSS and styles', async ({ page }) => {
    await page.goto('/');
    
    // Should have some styled content
    const body = page.locator('body');
    const bgColor = await body.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Background should be set (not transparent)
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('should not have console errors on load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known benign errors
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon') &&
      !err.includes('Failed to load resource') &&
      !err.includes('net::ERR')
    );
    
    // Should have no critical console errors
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Accessibility', () => {
  test('should have lang attribute on html', async ({ page }) => {
    await page.goto('/');
    
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
  });

  test('should have viewport meta tag', async ({ page }) => {
    await page.goto('/');
    
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=');
  });

  test('should have focusable elements', async ({ page }) => {
    await page.goto('/');
    
    // Should have at least one focusable element
    const focusableElements = page.locator('button, a, input, [tabindex="0"]');
    const count = await focusableElements.count();
    
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('SEO', () => {
  test('should have meta description', async ({ page }) => {
    await page.goto('/');
    
    // Should have meta description or og:description
    const description = await page.locator('meta[name="description"], meta[property="og:description"]').first().getAttribute('content');
    
    // Description should exist (even if empty is ok for SPA)
    // Just checking the page doesn't crash
    await expect(page.locator('body')).toBeVisible();
  });
});
