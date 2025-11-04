/**
 * Comprehensive tests for validation.ts
 * Testing URL validation, message validation, content validation, XSS, and utilities
 * File-related tests are in validation-file-types.test.ts
 */

import {
  validateURL,
  validateMessageLength,
  validateFileContent,
  validateFileName,
  validateForXSS,
  sanitizeHTML,
  formatFileSize,
  formatContentLength,
  isEmpty,
  VALIDATION_LIMITS,
} from '@/lib/validation';

describe('validation.ts - URL and Content Tests', () => {
  // ============================================
  // URL Validation Tests
  // ============================================
  describe('validateURL', () => {
    it('should accept valid HTTP URLs', () => {
      const result = validateURL('http://example.com');
      expect(result.isValid).toBe(true);
      expect(result.url).toBe('http://example.com/');
      expect(result.protocol).toBe('http:');
    });

    it('should accept valid HTTPS URLs', () => {
      const result = validateURL('https://www.google.com/search?q=test');
      expect(result.isValid).toBe(true);
      expect(result.protocol).toBe('https:');
    });

    it('should trim whitespace from URLs', () => {
      const result = validateURL('  https://example.com  ');
      expect(result.isValid).toBe(true);
      expect(result.url).toBe('https://example.com/');
    });

    it('should reject URLs that are too long', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(3000);
      const result = validateURL(longUrl);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('URL too long');
      expect(result.details).toContain('2048');
    });

    it('should reject invalid URL format', () => {
      const result = validateURL('not-a-url');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid URL format');
      expect(result.details).toContain('valid URL');
    });

    it('should reject file:// protocol', () => {
      const result = validateURL('file:///etc/passwd');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Unsupported protocol');
      expect(result.details).toContain('HTTP and HTTPS');
    });

    it('should reject javascript: protocol', () => {
      const result = validateURL('javascript:alert(1)');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Unsupported protocol');
    });

    it('should reject data: protocol', () => {
      const result = validateURL('data:text/html,<script>alert(1)</script>');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Unsupported protocol');
    });

    it('should reject ftp:// protocol', () => {
      const result = validateURL('ftp://example.com/file.txt');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Unsupported protocol');
      expect(result.details).toContain('HTTP and HTTPS');
    });

    it('should reject localhost URLs', () => {
      const result = validateURL('http://localhost:3000');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Private IP address not allowed');
    });

    it('should reject 127.0.0.1 (loopback)', () => {
      const result = validateURL('http://127.0.0.1');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Private IP address not allowed');
    });

    it('should reject 10.x.x.x (private Class A)', () => {
      const result = validateURL('http://10.0.0.1');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Private IP address not allowed');
    });

    it('should reject 192.168.x.x (private Class C)', () => {
      const result = validateURL('http://192.168.1.1');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Private IP address not allowed');
    });

    it('should reject 172.16.x.x (private Class B)', () => {
      const result = validateURL('http://172.16.0.1');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Private IP address not allowed');
    });

    it('should reject 169.254.x.x (link-local)', () => {
      const result = validateURL('http://169.254.1.1');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Private IP address not allowed');
    });

    it('should reject hostnames with double dots', () => {
      const result = validateURL('http://example..com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid hostname');
      expect(result.details).toContain('suspicious');
    });

    it('should reject hostnames starting with dot', () => {
      const result = validateURL('http://.example.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid hostname');
    });

    it('should reject hostnames ending with dot', () => {
      const result = validateURL('http://example.com.');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid hostname');
    });
  });

  // ============================================
  // Message Validation Tests
  // ============================================
  describe('validateMessageLength', () => {
    it('should accept valid messages', () => {
      const result = validateMessageLength('Hello, world!');
      expect(result.isValid).toBe(true);
    });

    it('should reject empty messages', () => {
      const result = validateMessageLength('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Message is empty');
    });

    it('should reject whitespace-only messages', () => {
      const result = validateMessageLength('   \n\t  ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Message is empty');
    });

    it('should accept single character messages', () => {
      const result = validateMessageLength('a');
      expect(result.isValid).toBe(true);
    });

    it('should reject messages exceeding max length', () => {
      const longMessage = 'a'.repeat(VALIDATION_LIMITS.MAX_MESSAGE_LENGTH + 1);
      const result = validateMessageLength(longMessage);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Message too long');
      expect(result.details).toContain('100,000');
    });

    it('should accept messages at exact max length', () => {
      const maxMessage = 'a'.repeat(VALIDATION_LIMITS.MAX_MESSAGE_LENGTH);
      const result = validateMessageLength(maxMessage);
      expect(result.isValid).toBe(true);
    });
  });

  // ============================================
  // File Content Validation Tests
  // ============================================
  describe('validateFileContent', () => {
    it('should accept valid file content', () => {
      const result = validateFileContent('This is some file content', 'test.txt');
      expect(result.isValid).toBe(true);
    });

    it('should reject empty file content', () => {
      const result = validateFileContent('', 'empty.txt');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File is empty');
      expect(result.details).toContain('empty.txt');
    });

    it('should reject whitespace-only content', () => {
      const result = validateFileContent('   \n\t  ', 'whitespace.txt');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File is empty');
    });

    it('should reject content exceeding max length', () => {
      const longContent = 'a'.repeat(VALIDATION_LIMITS.MAX_FILE_CONTENT_LENGTH + 1);
      const result = validateFileContent(longContent, 'large.txt');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File content too large');
      expect(result.details).toContain('500,000');
      expect(result.details).toContain('large.txt');
    });

    it('should accept content at exact max length', () => {
      const maxContent = 'a'.repeat(VALIDATION_LIMITS.MAX_FILE_CONTENT_LENGTH);
      const result = validateFileContent(maxContent, 'max.txt');
      expect(result.isValid).toBe(true);
    });
  });

  // ============================================
  // File Name Validation Tests
  // ============================================
  describe('validateFileName', () => {
    it('should accept valid file names', () => {
      const result = validateFileName('document.txt');
      expect(result.isValid).toBe(true);
    });

    it('should reject path traversal attempts with ..', () => {
      const result = validateFileName('../../../etc/passwd');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid file name');
      expect(result.details).toContain('invalid characters');
    });

    it('should reject forward slashes', () => {
      const result = validateFileName('path/to/file.txt');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid file name');
    });

    it('should reject backslashes', () => {
      const result = validateFileName('path\\to\\file.txt');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid file name');
    });

    it('should reject null bytes', () => {
      const result = validateFileName('file\0.txt');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid file name');
      expect(result.details).toContain('null bytes');
    });

    it('should reject file names exceeding 255 characters', () => {
      const longName = 'a'.repeat(256) + '.txt';
      const result = validateFileName(longName);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File name too long');
      expect(result.details).toContain('255');
    });

    it('should accept file names at 255 characters', () => {
      const maxName = 'a'.repeat(251) + '.txt'; // 251 + 4 = 255
      const result = validateFileName(maxName);
      expect(result.isValid).toBe(true);
    });
  });

  // ============================================
  // XSS Validation Tests
  // ============================================
  describe('validateForXSS', () => {
    it('should accept safe input', () => {
      const result = validateForXSS('This is a safe message');
      expect(result.isValid).toBe(true);
    });

    it('should detect <script> tags', () => {
      const result = validateForXSS('<script>alert(1)</script>');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Potentially unsafe content detected');
    });

    it('should detect case-insensitive <script> tags', () => {
      const result = validateForXSS('<SCRIPT>alert(1)</SCRIPT>');
      expect(result.isValid).toBe(false);
    });

    it('should detect javascript: protocol', () => {
      const result = validateForXSS('javascript:alert(1)');
      expect(result.isValid).toBe(false);
    });

    it('should detect event handlers (onclick)', () => {
      const result = validateForXSS('<div onclick="alert(1)">Click</div>');
      expect(result.isValid).toBe(false);
    });

    it('should detect event handlers (onload)', () => {
      const result = validateForXSS('<img onload="alert(1)" src="x">');
      expect(result.isValid).toBe(false);
    });

    it('should detect <iframe> tags', () => {
      const result = validateForXSS('<iframe src="evil.com"></iframe>');
      expect(result.isValid).toBe(false);
    });

    it('should detect <object> tags', () => {
      const result = validateForXSS('<object data="evil.swf"></object>');
      expect(result.isValid).toBe(false);
    });

    it('should detect <embed> tags', () => {
      const result = validateForXSS('<embed src="evil.swf">');
      expect(result.isValid).toBe(false);
    });

    it('should accept normal HTML-like text without attributes', () => {
      const result = validateForXSS('Use <div> for layout');
      expect(result.isValid).toBe(true);
    });
  });

  // ============================================
  // HTML Sanitization Tests
  // ============================================
  describe('sanitizeHTML', () => {
    it('should escape < and >', () => {
      const result = sanitizeHTML('<script>alert(1)</script>');
      expect(result).toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;');
    });

    it('should escape quotes', () => {
      const result = sanitizeHTML('Say "hello"');
      expect(result).toBe('Say &quot;hello&quot;');
    });

    it('should escape single quotes', () => {
      const result = sanitizeHTML("It's a test");
      expect(result).toBe('It&#x27;s a test');
    });

    it('should escape forward slashes', () => {
      const result = sanitizeHTML('</script>');
      expect(result).toBe('&lt;&#x2F;script&gt;');
    });

    it('should handle multiple special characters', () => {
      const result = sanitizeHTML('<a href="/test">Link</a>');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&#x2F;');
      expect(result).toContain('&quot;');
    });
  });

  // ============================================
  // Utility Functions Tests
  // ============================================
  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(1536)).toBe('1.50 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5.00 MB');
    });

    it('should format fractional megabytes', () => {
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.50 MB');
    });

    it('should handle zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });
  });

  describe('formatContentLength', () => {
    it('should format small character counts', () => {
      expect(formatContentLength(100)).toBe('100 characters');
      expect(formatContentLength(999)).toBe('999 characters');
    });

    it('should format thousands', () => {
      expect(formatContentLength(1000)).toBe('1.0K characters');
      expect(formatContentLength(5500)).toBe('5.5K characters');
    });

    it('should format millions', () => {
      expect(formatContentLength(1000000)).toBe('1.0M characters');
      expect(formatContentLength(2500000)).toBe('2.5M characters');
    });

    it('should handle zero', () => {
      expect(formatContentLength(0)).toBe('0 characters');
    });
  });

  describe('isEmpty', () => {
    it('should return true for null', () => {
      expect(isEmpty(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should return true for empty string', () => {
      expect(isEmpty('')).toBe(true);
    });

    it('should return true for whitespace-only strings', () => {
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty('\n\t  ')).toBe(true);
    });

    it('should return false for non-empty strings', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty(' hello ')).toBe(false);
    });
  });
});
