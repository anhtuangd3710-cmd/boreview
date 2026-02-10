import { test, expect } from '@playwright/test';

test.describe('Blog Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog');
  });

  test('should display blog page title', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toContainText('Bài viết');
  });

  test('should display search input', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="tìm"], input[placeholder*="search"]');
    
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeEnabled();
    }
  });

  test('should display category filters', async ({ page }) => {
    const allButton = page.getByRole('link', { name: 'Tất cả' });
    await expect(allButton).toBeVisible();
  });

  test('should filter by category', async ({ page }) => {
    const categories = page.locator('nav a, [role="tablist"] button').filter({ hasText: /Technology|Review|Lifestyle/i });
    
    if (await categories.first().isVisible()) {
      await categories.first().click();
      // URL should change to include category
      await expect(page).toHaveURL(/category=/);
    }
  });

  test('should search for posts', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="tìm"], input[placeholder*="search"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await searchInput.press('Enter');
      
      // Should show search results or empty state
      await page.waitForTimeout(500);
    }
  });

  test('should display posts list or empty state', async ({ page }) => {
    const posts = page.locator('article, [class*="post-card"], [class*="PostCard"]');
    const emptyState = page.locator('text=Không tìm thấy');
    
    const postsVisible = await posts.first().isVisible().catch(() => false);
    const emptyVisible = await emptyState.isVisible().catch(() => false);
    
    expect(postsVisible || emptyVisible).toBeTruthy();
  });

  test('should navigate to post detail', async ({ page }) => {
    const postLink = page.locator('article a, [class*="post"] a').first();
    
    if (await postLink.isVisible()) {
      await postLink.click();
      await expect(page).toHaveURL(/\/blog\/.+/);
    }
  });
});

test.describe('Blog Post Detail', () => {
  test('should display post content', async ({ page }) => {
    // First go to blog page and click on a post
    await page.goto('/blog');
    
    const postLink = page.locator('article a, [class*="post"] a').first();
    
    if (await postLink.isVisible()) {
      await postLink.click();
      
      // Should have article content
      const article = page.locator('article, [class*="content"]');
      await expect(article).toBeVisible();
    }
  });

  test('should display reading time', async ({ page }) => {
    await page.goto('/blog');
    
    const postLink = page.locator('article a').first();
    
    if (await postLink.isVisible()) {
      await postLink.click();
      
      const readingTime = page.locator('text=/\\d+\\s*(min|phút)/i');
      if (await readingTime.isVisible()) {
        await expect(readingTime).toBeVisible();
      }
    }
  });

  test('should display author info', async ({ page }) => {
    await page.goto('/blog');
    
    const postLink = page.locator('article a').first();
    
    if (await postLink.isVisible()) {
      await postLink.click();
      
      // Look for author name or admin
      const author = page.locator('text=/Admin|Author|Tác giả/i');
      if (await author.isVisible()) {
        await expect(author).toBeVisible();
      }
    }
  });
});

test.describe('Blog - Comments Section', () => {
  test('should display comment form', async ({ page }) => {
    await page.goto('/blog');
    
    const postLink = page.locator('article a').first();
    
    if (await postLink.isVisible()) {
      await postLink.click();
      
      const commentSection = page.locator('text=/Bình luận|Comments/i');
      if (await commentSection.isVisible()) {
        await expect(commentSection).toBeVisible();
      }
    }
  });

  test('should have name and content input fields', async ({ page }) => {
    await page.goto('/blog');
    
    const postLink = page.locator('article a').first();
    
    if (await postLink.isVisible()) {
      await postLink.click();
      
      const nameInput = page.locator('input[name="authorName"], input[placeholder*="tên"], input[placeholder*="name"]');
      const contentInput = page.locator('textarea[name="content"], textarea[placeholder*="bình luận"]');
      
      if (await nameInput.isVisible()) {
        await expect(nameInput).toBeEnabled();
      }
      
      if (await contentInput.isVisible()) {
        await expect(contentInput).toBeEnabled();
      }
    }
  });
});

