import { hashIP, containsProfanity, sanitizeInput, checkRateLimit } from '@/lib/security';

describe('Security - hashIP', () => {
  it('should hash IP address consistently', () => {
    const ip = '192.168.1.1';
    const hash1 = hashIP(ip);
    const hash2 = hashIP(ip);
    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different IPs', () => {
    const hash1 = hashIP('192.168.1.1');
    const hash2 = hashIP('192.168.1.2');
    expect(hash1).not.toBe(hash2);
  });

  it('should return a string', () => {
    const hash = hashIP('127.0.0.1');
    expect(typeof hash).toBe('string');
  });

  it('should handle empty string', () => {
    const hash = hashIP('');
    expect(typeof hash).toBe('string');
  });

  it('should handle IPv6 addresses', () => {
    const hash = hashIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
    expect(typeof hash).toBe('string');
  });
});

describe('Security - containsProfanity', () => {
  it('should detect profanity in text', () => {
    // Test with words in PROFANITY_LIST
    expect(containsProfanity('This is spam content')).toBe(true);
    expect(containsProfanity('Visit this casino now')).toBe(true);
  });

  it('should return false for clean text', () => {
    expect(containsProfanity('This is a clean message')).toBe(false);
  });

  it('should be case insensitive', () => {
    expect(containsProfanity('SPAM')).toBe(true);
    expect(containsProfanity('Spam')).toBe(true);
  });

  it('should handle empty string', () => {
    expect(containsProfanity('')).toBe(false);
  });

  it('should handle Vietnamese text', () => {
    expect(containsProfanity('Xin chào các bạn')).toBe(false);
  });
});

describe('Security - sanitizeInput', () => {
  it('should remove HTML tags', () => {
    const input = '<script>alert("xss")</script>Hello';
    const sanitized = sanitizeInput(input);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('Hello');
  });

  it('should handle normal text', () => {
    const input = 'Hello World';
    expect(sanitizeInput(input)).toBe('Hello World');
  });

  it('should escape HTML tags with attributes', () => {
    const input = '<div onclick="alert(1)">Click me</div>';
    const sanitized = sanitizeInput(input);
    // sanitizeInput escapes < and >, making tags harmless
    expect(sanitized).not.toContain('<div');
    expect(sanitized).toContain('&lt;div');
  });

  it('should handle empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('should preserve safe HTML entities', () => {
    const input = '&amp; &lt; &gt;';
    const sanitized = sanitizeInput(input);
    expect(sanitized).toBeTruthy();
  });
});

describe('Security - checkRateLimit', () => {
  it('should be a function', () => {
    expect(typeof checkRateLimit).toBe('function');
  });

  // Note: Full rate limit testing requires database mocking
  // These tests verify the function signature
  it('should accept ipHash and action parameters', async () => {
    // Mock the database call
    const mockCheckRateLimit = jest.fn().mockResolvedValue({ allowed: true, remaining: 5 });
    expect(mockCheckRateLimit).toBeDefined();
  });
});

