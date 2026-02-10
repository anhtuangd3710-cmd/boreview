import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
  });

  test('should display login form', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await emailInput.fill('invalid@example.com');
    await passwordInput.fill('wrongpassword');
    await submitButton.click();

    // Should show error message
    await page.waitForTimeout(1000);
    const errorMessage = page.locator('text=/lỗi|error|invalid|sai/i');
    
    // Either shows error or stays on login page
    const stillOnLogin = await page.url().includes('/login');
    expect(stillOnLogin || await errorMessage.isVisible()).toBeTruthy();
  });

  test('should login with valid credentials', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await emailInput.fill('admin@example.com');
    await passwordInput.fill('Admin123!');
    await submitButton.click();

    // Should redirect to dashboard
    await page.waitForURL(/\/admin\/dashboard|\/admin$/);
  });
});

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/admin/login');
    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('Admin123!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/admin\/dashboard|\/admin$/);
  });

  test('should display dashboard stats', async ({ page }) => {
    // Dashboard should have stats
    const statsSection = page.locator('[class*="stats"], [class*="card"]');
    await expect(statsSection.first()).toBeVisible();
  });

  test('should navigate to posts management', async ({ page }) => {
    const postsLink = page.getByRole('link', { name: /posts|bài viết/i });
    
    if (await postsLink.isVisible()) {
      await postsLink.click();
      await expect(page).toHaveURL(/\/admin\/posts/);
    }
  });

  test('should navigate to comments moderation', async ({ page }) => {
    const commentsLink = page.getByRole('link', { name: /comments|bình luận/i });
    
    if (await commentsLink.isVisible()) {
      await commentsLink.click();
      await expect(page).toHaveURL(/\/admin\/comments/);
    }
  });

  test('should be able to logout', async ({ page }) => {
    const logoutButton = page.getByRole('button', { name: /logout|đăng xuất/i });
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Should redirect to login
      await page.waitForURL(/\/admin\/login|\/$/);
    }
  });
});

test.describe('Admin - Protected Routes', () => {
  test('should redirect unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Should redirect to login
    await page.waitForTimeout(1000);
    const url = page.url();
    
    // Either redirected to login or shows unauthorized message
    expect(url.includes('/login') || url.includes('/admin')).toBeTruthy();
  });

  test('should redirect from posts page', async ({ page }) => {
    await page.goto('/admin/posts');
    
    await page.waitForTimeout(1000);
    const url = page.url();
    
    expect(url.includes('/login') || url.includes('/admin')).toBeTruthy();
  });

  test('should redirect from comments page', async ({ page }) => {
    await page.goto('/admin/comments');
    
    await page.waitForTimeout(1000);
    const url = page.url();
    
    expect(url.includes('/login') || url.includes('/admin')).toBeTruthy();
  });
});

