/**
 * Comprehensive tests for error-logger.ts
 * Testing error logging, persistence, formatting, and utility functions
 */

import {
  logError,
  logWarning,
  logInfo,
  getErrorHistory,
  clearErrorHistory,
  getPersistedErrorLogs,
  formatError,
  isNetworkError,
  isTimeoutError,
  getUserFriendlyMessage,
  downloadErrorLogs,
  type ErrorLog,
  type ErrorContext,
} from '@/lib/error-logger';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock console methods
const originalConsole = {
  error: console.error,
  warn: console.warn,
  log: console.log,
};

describe('error-logger.ts', () => {
  beforeEach(() => {
    clearErrorHistory();
    localStorageMock.clear();
    jest.clearAllMocks();
    
    // Mock console methods
    console.error = jest.fn();
    console.warn = jest.fn();
    console.log = jest.fn();
  });

  afterAll(() => {
    // Restore console
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.log = originalConsole.log;
  });

  // ============================================
  // Error Logging Tests
  // ============================================
  describe('logError', () => {
    it('should log an Error object', () => {
      const error = new Error('Test error');
      logError(error);

      const history = getErrorHistory();
      expect(history).toHaveLength(1);
      expect(history[0].message).toBe('Test error');
      expect(history[0].name).toBe('Error');
      expect(history[0].level).toBe('error');
      expect(history[0].stack).toBeDefined();
    });

    it('should log a string error', () => {
      logError('String error message');

      const history = getErrorHistory();
      expect(history).toHaveLength(1);
      expect(history[0].message).toBe('String error message');
      expect(history[0].name).toBe('Error');
      expect(history[0].stack).toBeUndefined();
    });

    it('should include context in error log', () => {
      const context: ErrorContext = {
        userAction: 'Clicked submit button',
        componentStack: 'ChatForm > App',
      };

      logError('Context error', context);

      const history = getErrorHistory();
      expect(history[0].context.userAction).toBe('Clicked submit button');
      expect(history[0].context.componentStack).toBe('ChatForm > App');
    });

    it('should add URL and userAgent to context', () => {
      logError('Browser context test');

      const history = getErrorHistory();
      expect(history[0].context.url).toBeDefined();
      expect(history[0].context.userAgent).toBeDefined();
    });

    it('should add timestamp in ISO format', () => {
      logError('Timestamp test');

      const history = getErrorHistory();
      expect(history[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should call console.error for error level', () => {
      logError('Console error test');
      expect(console.error).toHaveBeenCalled();
    });

    it('should maintain error history up to max limit', () => {
      // Log 60 errors (max is 50)
      for (let i = 0; i < 60; i++) {
        logError(`Error ${i}`);
      }

      const history = getErrorHistory();
      expect(history).toHaveLength(50);
      // Should have dropped the first 10 errors
      expect(history[0].message).toBe('Error 10');
      expect(history[49].message).toBe('Error 59');
    });

    it('should persist error to localStorage', () => {
      logError('Persistence test');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'error-logs',
        expect.any(String)
      );
    });
  });

  describe('logWarning', () => {
    it('should log warning with correct level', () => {
      logWarning('This is a warning');

      const history = getErrorHistory();
      expect(history).toHaveLength(1);
      expect(history[0].level).toBe('warning');
      expect(history[0].message).toBe('This is a warning');
    });

    it('should call console.warn for warnings', () => {
      logWarning('Console warning test');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should accept context parameter', () => {
      logWarning('Warning with context', { userAction: 'Test action' });

      const history = getErrorHistory();
      expect(history[0].context.userAction).toBe('Test action');
    });
  });

  describe('logInfo', () => {
    it('should log info with correct level', () => {
      logInfo('This is info');

      const history = getErrorHistory();
      expect(history).toHaveLength(1);
      expect(history[0].level).toBe('info');
      expect(history[0].message).toBe('This is info');
    });

    it('should call console.log for info', () => {
      logInfo('Console info test');
      expect(console.log).toHaveBeenCalled();
    });
  });

  // ============================================
  // Error History Tests
  // ============================================
  describe('getErrorHistory', () => {
    it('should return empty array initially', () => {
      const history = getErrorHistory();
      expect(history).toEqual([]);
    });

    it('should return copy of error history', () => {
      logError('Test 1');
      logError('Test 2');

      const history1 = getErrorHistory();
      const history2 = getErrorHistory();

      expect(history1).toHaveLength(2);
      expect(history1).not.toBe(history2); // Different array instances
      expect(history1).toEqual(history2); // Same content
    });

    it('should maintain order of errors', () => {
      logError('First');
      logError('Second');
      logError('Third');

      const history = getErrorHistory();
      expect(history[0].message).toBe('First');
      expect(history[1].message).toBe('Second');
      expect(history[2].message).toBe('Third');
    });
  });

  describe('clearErrorHistory', () => {
    it('should clear all errors from memory', () => {
      logError('Test 1');
      logError('Test 2');
      
      expect(getErrorHistory()).toHaveLength(2);

      clearErrorHistory();

      expect(getErrorHistory()).toHaveLength(0);
    });

    it('should clear persisted errors from localStorage', () => {
      logError('Test');
      clearErrorHistory();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('error-logs');
    });
  });

  // ============================================
  // Persistence Tests
  // ============================================
  describe('getPersistedErrorLogs', () => {
    it('should return empty array when no logs exist', () => {
      const logs = getPersistedErrorLogs();
      expect(logs).toEqual([]);
    });

    it('should retrieve persisted logs from localStorage', () => {
      const mockLogs: ErrorLog[] = [
        {
          message: 'Persisted error',
          name: 'Error',
          timestamp: new Date().toISOString(),
          context: {},
          level: 'error',
        },
      ];

      localStorageMock.setItem('error-logs', JSON.stringify(mockLogs));

      const logs = getPersistedErrorLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Persisted error');
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock.setItem('error-logs', 'invalid json{');

      const logs = getPersistedErrorLogs();
      expect(logs).toEqual([]);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should keep only last 20 errors in localStorage', () => {
      // Log 25 errors
      for (let i = 0; i < 25; i++) {
        logError(`Error ${i}`);
      }

      const persisted = getPersistedErrorLogs();
      expect(persisted.length).toBeLessThanOrEqual(20);
    });
  });

  // ============================================
  // Error Formatting Tests
  // ============================================
  describe('formatError', () => {
    it('should format string errors', () => {
      const result = formatError('Simple error');
      expect(result).toBe('Simple error');
    });

    it('should format Error objects with name and message', () => {
      const error = new Error('Test error');
      error.name = 'TestError';
      
      const result = formatError(error);
      expect(result).toContain('TestError: Test error');
    });

    it('should include stack trace if available', () => {
      const error = new Error('With stack');
      const result = formatError(error);
      
      expect(result).toContain('With stack');
      expect(result).toContain('at '); // Stack traces contain 'at'
    });

    it('should limit stack trace to 3 lines', () => {
      const error = new Error('Stack test');
      const result = formatError(error);
      
      const lines = result.split('\n');
      // First line is message, next 3 are stack
      expect(lines.length).toBeLessThanOrEqual(4);
    });
  });

  // ============================================
  // Error Type Detection Tests
  // ============================================
  describe('isNetworkError', () => {
    it('should detect "fetch" in error message', () => {
      const error = new Error('Failed to fetch');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should detect "network" in error message', () => {
      const error = new Error('network request failed');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should detect NetworkError by name', () => {
      const error = new Error('Connection failed');
      error.name = 'NetworkError';
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return false for non-network errors', () => {
      const error = new Error('Syntax error');
      expect(isNetworkError(error)).toBe(false);
    });
  });

  describe('isTimeoutError', () => {
    it('should detect "timeout" in error message', () => {
      const error = new Error('Request timeout');
      expect(isTimeoutError(error)).toBe(true);
    });

    it('should detect "timed out" in error message', () => {
      const error = new Error('Operation timed out');
      expect(isTimeoutError(error)).toBe(true);
    });

    it('should detect TimeoutError by name', () => {
      const error = new Error('Too slow');
      error.name = 'TimeoutError';
      expect(isTimeoutError(error)).toBe(true);
    });

    it('should return false for non-timeout errors', () => {
      const error = new Error('Validation failed');
      expect(isTimeoutError(error)).toBe(false);
    });
  });

  // ============================================
  // User-Friendly Messages Tests
  // ============================================
  describe('getUserFriendlyMessage', () => {
    it('should return friendly message for network errors', () => {
      const error = new Error('Failed to fetch');
      const message = getUserFriendlyMessage(error);
      
      expect(message).toContain('Network error');
      expect(message).toContain('internet connection');
    });

    it('should return friendly message for timeout errors', () => {
      const error = new Error('Request timed out');
      const message = getUserFriendlyMessage(error);
      
      expect(message).toContain('took too long');
    });

    it('should return friendly message for JSON parse errors', () => {
      const error = new Error('Unexpected JSON token');
      const message = getUserFriendlyMessage(error);
      
      expect(message).toContain('unexpected response');
    });

    it('should return friendly message for file errors', () => {
      const error = new Error('File upload failed');
      const message = getUserFriendlyMessage(error);
      
      expect(message).toContain('problem with the file');
    });

    it('should return generic message for unknown errors', () => {
      const error = new Error('Random error');
      const message = getUserFriendlyMessage(error);
      
      expect(message).toContain('Something went wrong');
      expect(message).toContain('try again');
    });

    it('should handle string errors', () => {
      const message = getUserFriendlyMessage('String error');
      expect(message).toContain('Something went wrong');
    });
  });

  // ============================================
  // Download Error Logs Tests
  // ============================================
  describe('downloadErrorLogs', () => {
    beforeEach(() => {
      // Mock DOM APIs
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
    });

    it('should create download link with error logs', () => {
      logError('Test error 1');
      logError('Test error 2');

      // Mock persisted logs
      const mockLogs: ErrorLog[] = [
        {
          message: 'Error 1',
          name: 'Error',
          timestamp: new Date().toISOString(),
          context: {},
          level: 'error',
        },
        {
          message: 'Error 2',
          name: 'Error',
          timestamp: new Date().toISOString(),
          context: {},
          level: 'error',
        },
      ];
      localStorageMock.setItem('error-logs', JSON.stringify(mockLogs));

      const clickSpy = jest.fn();
      const mockLink = {
        href: '',
        download: '',
        click: clickSpy,
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

      downloadErrorLogs();

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
      expect(mockLink.download).toContain('error-logs-');
      expect(mockLink.download).toContain('.json');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should handle empty error logs', () => {
      const clickSpy = jest.fn();
      const mockLink = {
        href: '',
        download: '',
        click: clickSpy,
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

      downloadErrorLogs();

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  // ============================================
  // Integration Tests
  // ============================================
  describe('Integration Tests', () => {
    it('should handle mixed error levels', () => {
      logError('Error message');
      logWarning('Warning message');
      logInfo('Info message');

      const history = getErrorHistory();
      expect(history).toHaveLength(3);
      expect(history[0].level).toBe('error');
      expect(history[1].level).toBe('warning');
      expect(history[2].level).toBe('info');
    });

    it('should persist and retrieve multiple errors', () => {
      logError('Error 1');
      logError('Error 2');
      logWarning('Warning 1');

      const persisted = getPersistedErrorLogs();
      expect(persisted.length).toBeGreaterThan(0);
      
      const messages = persisted.map(log => log.message);
      expect(messages).toContain('Error 1');
      expect(messages).toContain('Error 2');
      expect(messages).toContain('Warning 1');
    });

    it('should maintain separate memory and persisted logs', () => {
      // Log 55 errors (memory keeps 50, localStorage keeps 20)
      for (let i = 0; i < 55; i++) {
        logError(`Error ${i}`);
      }

      const memoryLogs = getErrorHistory();
      const persistedLogs = getPersistedErrorLogs();

      expect(memoryLogs).toHaveLength(50);
      expect(persistedLogs.length).toBeLessThanOrEqual(20);
    });

    it('should handle localStorage quota exceeded gracefully', () => {
      // Mock localStorage.setItem to throw quota error
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw
      expect(() => logError('Test error')).not.toThrow();
      
      // Should still add to memory
      const history = getErrorHistory();
      expect(history).toHaveLength(1);
    });
  });
});
