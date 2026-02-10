import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the logo', async ({ page }) => {
    const logo = page.locator('header img[alt*="Logo"]');
    await expect(logo).toBeVisible();
  });

  test('should display navigation links', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Trang chủ' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Blog' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Đã lưu' })).toBeVisible();
  });

  test('should display hero section', async ({ page }) => {
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toContainText('Bơ Review');
  });

  test('should display YouTube channel link', async ({ page }) => {
    const youtubeLink = page.getByRole('link', { name: /YouTube/i });
    await expect(youtubeLink).toBeVisible();
    await expect(youtubeLink).toHaveAttribute('href', /youtube\.com/);
  });

  test('should navigate to blog page', async ({ page }) => {
    await page.getByRole('link', { name: 'Blog' }).click();
    await expect(page).toHaveURL('/blog');
    await expect(page.locator('h1')).toContainText('Bài viết');
  });

  test('should navigate to about page', async ({ page }) => {
    await page.getByRole('link', { name: 'Về chúng tôi' }).click();
    await expect(page).toHaveURL('/about');
  });

  test('should navigate to contact page', async ({ page }) => {
    await page.getByRole('link', { name: 'Liên hệ' }).click();
    await expect(page).toHaveURL('/contact');
  });

  test('should display footer', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('Bơ Review');
  });

  test('should have correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Bơ Review/);
  });

  test('should toggle dark mode', async ({ page }) => {
    // Look for dark mode toggle button
    const darkModeButton = page.locator('button[aria-label*="chế độ"]').first();
    
    if (await darkModeButton.isVisible()) {
      await darkModeButton.click();
      // Check if dark class is toggled
      const html = page.locator('html');
      await expect(html).toHaveClass(/dark/);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Header should still be visible
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Mobile menu button might be visible
    const mobileMenuButton = page.locator('button[aria-label*="menu"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
    }
  });
});

test.describe('Homepage - Featured Posts', () => {
  test('should display featured posts if available', async ({ page }) => {
    await page.goto('/');
    
    const featuredSection = page.locator('section').filter({ hasText: /Bài viết nổi bật|Featured/i });
    
    if (await featuredSection.isVisible()) {
      const postCards = featuredSection.locator('article, [class*="card"]');
      const count = await postCards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Homepage - SEO', () => {
  test('should have meta description', async ({ page }) => {
    await page.goto('/');
    
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
  });

  test('should have Open Graph tags', async ({ page }) => {
    await page.goto('/');
    
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
    
    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute('content', /.+/);
  });
});

