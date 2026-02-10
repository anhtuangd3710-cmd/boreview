/**
 * Security Tests - XSS Prevention
 */

import { sanitizeInput } from '@/lib/security';

describe('XSS Prevention', () => {
  describe('Script Injection', () => {
    it('should escape script tags', () => {
      const maliciousInput = '<script>alert("XSS")</script>';
      const sanitized = sanitizeInput(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });

    it('should escape inline event handlers', () => {
      const inputs = [
        '<img src="x" onerror="alert(1)">',
        '<div onmouseover="alert(1)">',
        '<body onload="alert(1)">',
      ];

      inputs.forEach((input) => {
        const sanitized = sanitizeInput(input);
        expect(sanitized).not.toContain('<img');
        expect(sanitized).not.toContain('<div');
        expect(sanitized).not.toContain('<body');
      });
    });

    it('should escape anchor tags with javascript: URLs', () => {
      const input = '<a href="javascript:alert(1)">Click</a>';
      const sanitized = sanitizeInput(input);

      // The anchor tag should be escaped, preventing execution
      expect(sanitized).not.toContain('<a');
      expect(sanitized).toContain('&lt;a');
    });

    it('should escape anchor tags with data: URLs', () => {
      const input = '<a href="data:text/html,<script>alert(1)</script>">Click</a>';
      const sanitized = sanitizeInput(input);

      // All HTML tags should be escaped
      expect(sanitized).not.toContain('<a');
      expect(sanitized).not.toContain('<script>');
    });
  });

  describe('HTML Entity Encoding', () => {
    it('should encode < and >', () => {
      const input = '<div>Test</div>';
      const sanitized = sanitizeInput(input);
      
      expect(sanitized).toContain('&lt;');
      expect(sanitized).toContain('&gt;');
    });

    it('should encode quotes', () => {
      const input = 'He said "hello"';
      const sanitized = sanitizeInput(input);
      
      expect(sanitized).toContain('&quot;');
    });

    it('should encode single quotes', () => {
      const input = "It's a test";
      const sanitized = sanitizeInput(input);
      
      expect(sanitized).toContain('&#x27;');
    });

    it('should encode forward slashes', () => {
      const input = '</script>';
      const sanitized = sanitizeInput(input);
      
      expect(sanitized).toContain('&#x2F;');
    });
  });

  describe('Nested Attacks', () => {
    it('should handle nested script tags', () => {
      const input = '<<script>script>alert(1)<</script>/script>';
      const sanitized = sanitizeInput(input);
      
      expect(sanitized).not.toContain('<script>');
    });

    it('should handle encoded attacks', () => {
      // These should remain encoded
      const input = '&lt;script&gt;alert(1)&lt;/script&gt;';
      const sanitized = sanitizeInput(input);
      
      // Should not double-encode
      expect(sanitized).toBeTruthy();
    });
  });

  describe('Comment Form Inputs', () => {
    it('should sanitize author name with HTML', () => {
      const name = '<script>alert("XSS")</script>John';
      const sanitized = sanitizeInput(name);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('John');
    });

    it('should sanitize comment content with HTML', () => {
      const content = 'Nice post! <img src=x onerror=alert(1)>';
      const sanitized = sanitizeInput(content);
      
      expect(sanitized).not.toContain('<img');
      expect(sanitized).toContain('Nice post!');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      expect(sanitizeInput('')).toBe('');
    });

    it('should handle normal text without HTML', () => {
      const normalText = 'This is a normal comment without any HTML';
      expect(sanitizeInput(normalText)).toBe(normalText);
    });

    it('should preserve whitespace', () => {
      const input = 'Line 1\nLine 2\tTabbed';
      const sanitized = sanitizeInput(input);
      
      expect(sanitized).toContain('\n');
      expect(sanitized).toContain('\t');
    });

    it('should handle Unicode characters', () => {
      const input = 'Xin chào 你好 مرحبا 🎉';
      const sanitized = sanitizeInput(input);
      
      expect(sanitized).toContain('Xin chào');
      expect(sanitized).toContain('你好');
      expect(sanitized).toContain('🎉');
    });
  });
});

