import { formatRelativeTime, calculateReadingTime, truncateText, getLocalStorage, setLocalStorage, REACTION_EMOJIS, generateExcerpt } from '@/lib/utils';

describe('Utils - formatRelativeTime', () => {
  it('should return "just now" for recent dates', () => {
    const now = new Date();
    expect(formatRelativeTime(now.toISOString())).toBe('just now');
  });

  it('should return minutes ago for dates within an hour', () => {
    const date = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
    const result = formatRelativeTime(date.toISOString());
    expect(result).toMatch(/\d+m ago/);
  });

  it('should return hours ago for dates within a day', () => {
    const date = new Date(Date.now() - 5 * 60 * 60 * 1000); // 5 hours ago
    const result = formatRelativeTime(date.toISOString());
    expect(result).toMatch(/\d+h ago/);
  });

  it('should return days ago for dates within a week', () => {
    const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    const result = formatRelativeTime(date.toISOString());
    expect(result).toMatch(/\d+d ago/);
  });
});

describe('Utils - generateExcerpt', () => {
  it('should strip HTML tags', () => {
    const html = '<p>Hello <strong>World</strong></p>';
    expect(generateExcerpt(html)).toBe('Hello World');
  });

  it('should truncate long content', () => {
    const longText = 'a'.repeat(200);
    const result = generateExcerpt(longText, 50);
    expect(result.length).toBeLessThanOrEqual(53); // 50 + '...'
  });

  it('should handle empty content', () => {
    expect(generateExcerpt('')).toBe('');
  });
});

describe('Utils - calculateReadingTime', () => {
  it('should return 1 minute for short content', () => {
    const shortContent = 'Hello world';
    expect(calculateReadingTime(shortContent)).toBe(1);
  });

  it('should calculate reading time based on 200 WPM', () => {
    const words = Array(400).fill('word').join(' '); // 400 words = 2 minutes
    expect(calculateReadingTime(words)).toBe(2);
  });

  it('should handle empty content', () => {
    expect(calculateReadingTime('')).toBe(1);
  });

  it('should strip HTML tags', () => {
    const htmlContent = '<p>Hello</p> <strong>World</strong>';
    expect(calculateReadingTime(htmlContent)).toBe(1);
  });
});

describe('Utils - truncateText', () => {
  it('should not truncate short text', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('should truncate long text with ellipsis', () => {
    expect(truncateText('Hello World', 5)).toBe('Hello...');
  });

  it('should handle empty string', () => {
    expect(truncateText('', 10)).toBe('');
  });
});

describe('Utils - localStorage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should set and get localStorage value', () => {
    setLocalStorage('test', { foo: 'bar' });
    expect(getLocalStorage('test', null)).toEqual({ foo: 'bar' });
  });

  it('should return default value for non-existent key', () => {
    expect(getLocalStorage('nonexistent', 'default')).toBe('default');
  });

  it('should handle arrays', () => {
    setLocalStorage('array', [1, 2, 3]);
    expect(getLocalStorage('array', [])).toEqual([1, 2, 3]);
  });
});

describe('Utils - REACTION_EMOJIS', () => {
  it('should have all reaction types', () => {
    expect(REACTION_EMOJIS).toHaveProperty('like');
    expect(REACTION_EMOJIS).toHaveProperty('love');
    expect(REACTION_EMOJIS).toHaveProperty('laugh');
    expect(REACTION_EMOJIS).toHaveProperty('wow');
    expect(REACTION_EMOJIS).toHaveProperty('sad');
  });

  it('should have emoji values', () => {
    expect(REACTION_EMOJIS.like).toBe('👍');
    expect(REACTION_EMOJIS.love).toBe('❤️');
    expect(REACTION_EMOJIS.laugh).toBe('😂');
    expect(REACTION_EMOJIS.wow).toBe('😮');
    expect(REACTION_EMOJIS.sad).toBe('😢');
  });
});

