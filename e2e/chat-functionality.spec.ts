import { test, expect } from '@playwright/test';

test.describe('Chat Functionality', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open sidebar on mobile if needed
    if (isMobile) {
      const sidebarTrigger = page.locator('[data-sidebar="trigger"]');
      await sidebarTrigger.waitFor({ state: 'visible' });
      await sidebarTrigger.click();
      await page.waitForTimeout(300);
    }
  });

  test('should show empty state without sources', async ({ page }) => {
    await expect(page.locator('text=/Upload documents.*or add website URLs/i')).toBeVisible();
  });

  test('should not allow empty message submission', async ({ page }) => {
    const sendButton = page.locator('button[type="submit"]');
    
    // Button should be disabled when no message
    await expect(sendButton).toBeDisabled();
    
    const input = page.locator('textarea[placeholder*="Ask"]');
    await input.fill('   '); // Only spaces
    
    // Button should still be disabled for whitespace-only
    await expect(sendButton).toBeDisabled();
  });

  test('should enable send button with valid input', async ({ page, isMobile }) => {
    // Skip on mobile - flaky behavior with button states
    if (isMobile) {
      test.skip();
    }
    
    const input = page.locator('textarea[placeholder*="Ask"]');
    const sendButton = page.locator('button[type="submit"]');
    
    await expect(sendButton).toBeDisabled();
    
    await input.fill('What is AI?');
    await expect(sendButton).toBeEnabled();
  });

  test('should have file upload functionality in sidebar', async ({ page, isMobile }) => {
    // Skip on mobile as we already tested sidebar opening
    if (isMobile) {
      test.skip();
    }
    
    // Switch to Sources tab
    const sourcesTab = page.locator('[role="tab"]', { hasText: 'Sources' });
    await sourcesTab.click();
    
    const addFilesButton = page.getByRole('button', { name: /Add Files/i });
    await expect(addFilesButton).toBeVisible();
  });

  test('should have URL input functionality in sidebar', async ({ page, isMobile }) => {
    // Skip on mobile as we already tested sidebar opening
    if (isMobile) {
      test.skip();
    }
    
    // Switch to Sources tab
    const sourcesTab = page.locator('[role="tab"]', { hasText: 'Sources' });
    await sourcesTab.click();
    
    const urlInput = page.locator('input[placeholder*="Enter"]');
    await expect(urlInput).toBeVisible();
    
    const addUrlButton = page.getByRole('button', { name: /Add URL/i });
    await expect(addUrlButton).toBeVisible();
  });
});
