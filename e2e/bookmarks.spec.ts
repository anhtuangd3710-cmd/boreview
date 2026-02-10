import { test, expect } from '@playwright/test';

test.describe('Bookmarks Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bookmarks');
  });

  test('should display bookmarks page title', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toContainText('Bài viết đã lưu');
  });

  test('should show empty state when no bookmarks', async ({ page }) => {
    // Clear any existing bookmarks
    await page.evaluate(() => {
      localStorage.removeItem('bookmarks');
    });
    
    await page.reload();
    
    const emptyState = page.locator('text=/Chưa có bài viết nào được lưu|No saved/i');
    await expect(emptyState).toBeVisible();
  });

  test('should have link to explore posts', async ({ page }) => {
    // Clear bookmarks
    await page.evaluate(() => {
      localStorage.removeItem('bookmarks');
    });
    
    await page.reload();
    
    const exploreLink = page.getByRole('link', { name: /Khám phá bài viết/i });
    
    if (await exploreLink.isVisible()) {
      await exploreLink.click();
      await expect(page).toHaveURL('/blog');
    }
  });
});

test.describe('Bookmark Functionality', () => {
  test('should bookmark a post', async ({ page }) => {
    // Clear existing bookmarks
    await page.evaluate(() => {
      localStorage.removeItem('bookmarks');
    });
    
    // Go to blog page and find a post
    await page.goto('/blog');
    
    const postLink = page.locator('article a').first();
    
    if (await postLink.isVisible()) {
      await postLink.click();
      
      // Find bookmark button
      const bookmarkButton = page.locator('button[aria-label*="bookmark"], button[aria-label*="lưu"], button:has-text("Lưu")');
      
      if (await bookmarkButton.isVisible()) {
        await bookmarkButton.click();
        
        // Check localStorage
        const bookmarks = await page.evaluate(() => {
          return localStorage.getItem('bookmarks');
        });
        
        expect(bookmarks).toBeTruthy();
      }
    }
  });

  test('should remove bookmark', async ({ page }) => {
    // First add a bookmark
    await page.evaluate(() => {
      const bookmark = {
        id: 'test-post',
        title: 'Test Post',
        slug: 'test-post',
        excerpt: 'Test excerpt',
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('bookmarks', JSON.stringify([bookmark]));
    });
    
    await page.goto('/bookmarks');
    
    // Find remove button
    const removeButton = page.locator('button[aria-label*="Bỏ lưu"], button[aria-label*="remove"]');
    
    if (await removeButton.isVisible()) {
      await removeButton.click();
      
      // Verify bookmark was removed
      await page.waitForTimeout(500);
      
      const emptyState = page.locator('text=/Chưa có bài viết nào được lưu/i');
      await expect(emptyState).toBeVisible();
    }
  });

  test('should persist bookmarks across page reloads', async ({ page }) => {
    // Add bookmark to localStorage
    await page.evaluate(() => {
      const bookmark = {
        id: 'persistent-test',
        title: 'Persistent Test Post',
        slug: 'persistent-test',
        excerpt: 'This bookmark should persist',
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('bookmarks', JSON.stringify([bookmark]));
    });
    
    await page.goto('/bookmarks');
    
    // Verify bookmark is visible
    const bookmarkTitle = page.locator('text=Persistent Test Post');
    await expect(bookmarkTitle).toBeVisible();
    
    // Reload page
    await page.reload();
    
    // Bookmark should still be visible
    await expect(bookmarkTitle).toBeVisible();
  });
});

test.describe('Bookmarks - Clear All', () => {
  test('should clear all bookmarks', async ({ page }) => {
    // Add multiple bookmarks
    await page.evaluate(() => {
      const bookmarks = [
        { id: '1', title: 'Post 1', slug: 'post-1', excerpt: 'Excerpt 1', savedAt: new Date().toISOString() },
        { id: '2', title: 'Post 2', slug: 'post-2', excerpt: 'Excerpt 2', savedAt: new Date().toISOString() },
      ];
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    });
    
    await page.goto('/bookmarks');
    
    const clearAllButton = page.getByRole('button', { name: /Xóa tất cả/i });
    
    if (await clearAllButton.isVisible()) {
      // Handle confirm dialog
      page.on('dialog', dialog => dialog.accept());
      
      await clearAllButton.click();
      
      // Verify all bookmarks removed
      const emptyState = page.locator('text=/Chưa có bài viết nào được lưu/i');
      await expect(emptyState).toBeVisible();
    }
  });
});

