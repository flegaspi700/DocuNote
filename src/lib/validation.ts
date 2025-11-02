/**
 * Input Validation Utilities
 * 
 * Provides comprehensive validation for:
 * - File uploads (size, type, content)
 * - URLs (security, reachability)
 * - User input (length, content)
 * - Security checks (XSS, injection)
 */

// ============================================================================
// Constants
// ============================================================================

export const VALIDATION_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_MESSAGE_LENGTH: 100000, // 100K characters
  MAX_FILE_CONTENT_LENGTH: 500000, // 500K characters
  MAX_URL_LENGTH: 2048, // Standard browser limit
  MIN_MESSAGE_LENGTH: 1,
  ALLOWED_FILE_TYPES: ['.txt', '.pdf', '.md', '.csv', '.docx'],
  ALLOWED_MIME_TYPES: [
    'text/plain', 
    'application/pdf',
    'text/markdown',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
} as const;

// ============================================================================
// Type Definitions
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  details?: string;
}

export interface FileValidationResult extends ValidationResult {
  file?: File;
  sizeInMB?: number;
}

export interface URLValidationResult extends ValidationResult {
  url?: string;
  protocol?: string;
}

// ============================================================================
// File Validation
// ============================================================================

/**
 * Validates file size against the maximum allowed limit
 */
export function validateFileSize(file: File): ValidationResult {
  const sizeInMB = file.size / (1024 * 1024);
  
  if (file.size > VALIDATION_LIMITS.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds ${VALIDATION_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
      details: `File "${file.name}" is ${sizeInMB.toFixed(2)}MB. Please upload a smaller file.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates file type by extension and MIME type
 */
export function validateFileType(file: File): ValidationResult {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  // Check extension
  type AllowedExtensions = '.txt' | '.pdf' | '.md' | '.csv' | '.docx';
  if (!VALIDATION_LIMITS.ALLOWED_FILE_TYPES.includes(extension as AllowedExtensions)) {
    return {
      isValid: false,
      error: `Invalid file type: ${extension}`,
      details: `Only ${VALIDATION_LIMITS.ALLOWED_FILE_TYPES.join(', ')} files are supported.`,
    };
  }

  // Check MIME type - but be lenient for markdown as it has multiple possible MIME types
  const allowedMimes: string[] = [...VALIDATION_LIMITS.ALLOWED_MIME_TYPES];
  const isMarkdown = extension === '.md' && (
    file.type === 'text/markdown' || 
    file.type === 'text/x-markdown' || 
    file.type === 'text/plain' ||
    file.type === '' // Some browsers don't set MIME for .md files
  );
  
  const isCsv = extension === '.csv' && (
    file.type === 'text/csv' ||
    file.type === 'application/vnd.ms-excel' ||
    file.type === 'text/plain'
  );
  
  if (!allowedMimes.includes(file.type) && !isMarkdown && !isCsv) {
    return {
      isValid: false,
      error: `Invalid MIME type: ${file.type}`,
      details: `File appears to be ${file.type}, but only ${VALIDATION_LIMITS.ALLOWED_MIME_TYPES.join(', ')} are allowed.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates file name for security issues
 */
export function validateFileName(fileName: string): ValidationResult {
  // Check for path traversal attempts
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return {
      isValid: false,
      error: 'Invalid file name',
      details: 'File name contains invalid characters. Please rename the file.',
    };
  }

  // Check for null bytes (security)
  if (fileName.includes('\0')) {
    return {
      isValid: false,
      error: 'Invalid file name',
      details: 'File name contains null bytes.',
    };
  }

  // Check length
  if (fileName.length > 255) {
    return {
      isValid: false,
      error: 'File name too long',
      details: 'File name must be less than 255 characters.',
    };
  }

  return { isValid: true };
}

/**
 * Comprehensive file validation
 */
export function validateFile(file: File): FileValidationResult {
  // Validate file name
  const nameCheck = validateFileName(file.name);
  if (!nameCheck.isValid) {
    return { ...nameCheck, file };
  }

  // Validate file type
  const typeCheck = validateFileType(file);
  if (!typeCheck.isValid) {
    return { ...typeCheck, file };
  }

  // Validate file size
  const sizeCheck = validateFileSize(file);
  if (!sizeCheck.isValid) {
    return { 
      ...sizeCheck, 
      file,
      sizeInMB: file.size / (1024 * 1024),
    };
  }

  return { 
    isValid: true, 
    file,
    sizeInMB: file.size / (1024 * 1024),
  };
}

// ============================================================================
// Content Validation
// ============================================================================

/**
 * Validates file content length after reading
 */
export function validateFileContent(content: string, fileName: string): ValidationResult {
  if (content.length > VALIDATION_LIMITS.MAX_FILE_CONTENT_LENGTH) {
    return {
      isValid: false,
      error: 'File content too large',
      details: `"${fileName}" contains ${content.length.toLocaleString()} characters. Maximum is ${VALIDATION_LIMITS.MAX_FILE_CONTENT_LENGTH.toLocaleString()}.`,
    };
  }

  if (content.trim().length === 0) {
    return {
      isValid: false,
      error: 'File is empty',
      details: `"${fileName}" appears to be empty or contains only whitespace.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates user message length
 */
export function validateMessageLength(message: string): ValidationResult {
  const trimmed = message.trim();

  if (trimmed.length < VALIDATION_LIMITS.MIN_MESSAGE_LENGTH) {
    return {
      isValid: false,
      error: 'Message is empty',
      details: 'Please enter a message before submitting.',
    };
  }

  if (trimmed.length > VALIDATION_LIMITS.MAX_MESSAGE_LENGTH) {
    return {
      isValid: false,
      error: 'Message too long',
      details: `Message is ${trimmed.length.toLocaleString()} characters. Maximum is ${VALIDATION_LIMITS.MAX_MESSAGE_LENGTH.toLocaleString()}.`,
    };
  }

  return { isValid: true };
}

// ============================================================================
// URL Validation
// ============================================================================

/**
 * List of dangerous protocols that should be blocked
 */
const BLOCKED_PROTOCOLS = [
  'file:',
  'javascript:',
  'data:',
  'vbscript:',
  'about:',
] as const;

/**
 * List of private/internal IP patterns to block
 */
const PRIVATE_IP_PATTERNS = [
  /^127\./,           // Loopback
  /^10\./,            // Private Class A
  /^172\.(1[6-9]|2\d|3[0-1])\./,  // Private Class B
  /^192\.168\./,      // Private Class C
  /^169\.254\./,      // Link-local
  /^0\./,             // Invalid
  /^224\./,           // Multicast
  /^255\./,           // Broadcast
  /localhost/i,       // Localhost hostname
] as const;

/**
 * Validates URL format and security
 */
export function validateURL(urlString: string): URLValidationResult {
  // Check length
  if (urlString.length > VALIDATION_LIMITS.MAX_URL_LENGTH) {
    return {
      isValid: false,
      error: 'URL too long',
      details: `URL must be less than ${VALIDATION_LIMITS.MAX_URL_LENGTH} characters.`,
    };
  }

  // Trim whitespace
  const trimmedUrl = urlString.trim();

  // Try to parse URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format',
      details: 'Please enter a valid URL (e.g., https://example.com)',
    };
  }

  // Check protocol
  const protocol = parsedUrl.protocol.toLowerCase();
  if (!['http:', 'https:'].includes(protocol)) {
    return {
      isValid: false,
      error: 'Unsupported protocol',
      details: `Only HTTP and HTTPS URLs are supported. Found: ${protocol}`,
      protocol,
    };
  }

  // Check for blocked protocols (XSS protection)
  if (BLOCKED_PROTOCOLS.includes(protocol as typeof BLOCKED_PROTOCOLS[number])) {
    return {
      isValid: false,
      error: 'Blocked protocol',
      details: `Protocol "${protocol}" is not allowed for security reasons.`,
      protocol,
    };
  }

  // Check for private/internal IPs (SSRF protection)
  const hostname = parsedUrl.hostname.toLowerCase();
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return {
        isValid: false,
        error: 'Private IP address not allowed',
        details: 'Cannot scrape internal/private IP addresses for security reasons.',
        url: trimmedUrl,
      };
    }
  }

  // Check for suspicious patterns
  if (hostname.includes('..') || hostname.startsWith('.') || hostname.endsWith('.')) {
    return {
      isValid: false,
      error: 'Invalid hostname',
      details: 'Hostname contains suspicious patterns.',
    };
  }

  return { 
    isValid: true, 
    url: parsedUrl.href,
    protocol,
  };
}

// ============================================================================
// Security Validation
// ============================================================================

/**
 * Checks for potential XSS patterns in user input
 */
export function validateForXSS(input: string): ValidationResult {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      return {
        isValid: false,
        error: 'Potentially unsafe content detected',
        details: 'Input contains patterns that could be security risks.',
      };
    }
  }

  return { isValid: true };
}

/**
 * Sanitizes HTML content (basic sanitization)
 */
export function sanitizeHTML(html: string): string {
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Formats content length for display
 */
export function formatContentLength(length: number): string {
  if (length < 1000) return `${length} characters`;
  if (length < 1000000) return `${(length / 1000).toFixed(1)}K characters`;
  return `${(length / 1000000).toFixed(1)}M characters`;
}

/**
 * Checks if a value is empty or only whitespace
 */
export function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}
