import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Error from '@/app/error';
import * as errorLogger from '@/lib/error-logger';

// Mock the error logger
jest.mock('@/lib/error-logger', () => ({
  logError: jest.fn(),
}));

// Mock window.location
const mockWindowLocation = () => {
  delete (window as any).location;
  window.location = { href: '' } as any;
};

// Helper to create mock error
const createMockError = (message: string, options?: { digest?: string; stack?: string }): Error & { digest?: string } => {
  const error = {
    name: 'Error',
    message,
    stack: options?.stack,
    digest: options?.digest,
  } as Error & { digest?: string };
  return error;
};

// Store original NODE_ENV
const originalEnv = process.env.NODE_ENV;

describe('Error Page', () => {
  const mockReset = jest.fn();
  const mockError = createMockError('Test error message');

  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowLocation();
    (process.env as any).NODE_ENV = 'production';
  });

  afterEach(() => {
    (process.env as any).NODE_ENV = originalEnv;
  });

  describe('Rendering', () => {
    it('should render error page with title', () => {
      render(<Error error={mockError} reset={mockReset} />);

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('should render error description', () => {
      render(<Error error={mockError} reset={mockReset} />);

      expect(screen.getByText(/We encountered an unexpected error/)).toBeInTheDocument();
      expect(screen.getByText(/your data is safe/)).toBeInTheDocument();
    });

    it('should render alert triangle icon', () => {
      const { container } = render(<Error error={mockError} reset={mockReset} />);

      const icon = container.querySelector('svg[data-lucide="AlertTriangle"]');
      expect(icon).toBeInTheDocument();
    });

    it('should render Try Again button', () => {
      render(<Error error={mockError} reset={mockReset} />);

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should render Go Home button', () => {
      render(<Error error={mockError} reset={mockReset} />);

      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
    });

    it('should render help text', () => {
      render(<Error error={mockError} reset={mockReset} />);

      expect(screen.getByText(/If the problem persists/)).toBeInTheDocument();
    });
  });

  describe('Error Logging', () => {
    it('should log error on mount', async () => {
      render(<Error error={mockError} reset={mockReset} />);

      await waitFor(() => {
        expect(errorLogger.logError).toHaveBeenCalledWith(
          mockError,
          expect.objectContaining({
            errorPage: true,
          })
        );
      });
    });

    it('should log error with digest if provided', async () => {
      const errorWithDigest = createMockError('Test', { digest: 'abc123' });
      
      render(<Error error={errorWithDigest} reset={mockReset} />);

      await waitFor(() => {
        expect(errorLogger.logError).toHaveBeenCalledWith(
          errorWithDigest,
          expect.objectContaining({
            digest: 'abc123',
            errorPage: true,
          })
        );
      });
    });

    it('should log error with URL in browser', async () => {
      // Update the already-mocked window.location
      window.location.href = 'http://localhost:3000/test';
      
      render(<Error error={mockError} reset={mockReset} />);

      await waitFor(() => {
        expect(errorLogger.logError).toHaveBeenCalled();
        const call = (errorLogger.logError as jest.Mock).mock.calls[0];
        expect(call[1]).toHaveProperty('url');
      });
    });

    it('should only log error once on mount', async () => {
      render(<Error error={mockError} reset={mockReset} />);

      await waitFor(() => {
        expect(errorLogger.logError).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('User Interactions', () => {
    it('should call reset when Try Again button clicked', async () => {
      const user = userEvent.setup();
      render(<Error error={mockError} reset={mockReset} />);

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it('should navigate home when Go Home button clicked', async () => {
      const user = userEvent.setup();
      render(<Error error={mockError} reset={mockReset} />);

      const goHomeButton = screen.getByRole('button', { name: /go home/i });
      await user.click(goHomeButton);

      expect(window.location.href).toContain('/');
    });

    it('should not call reset when Go Home button clicked', async () => {
      const user = userEvent.setup();
      render(<Error error={mockError} reset={mockReset} />);

      const goHomeButton = screen.getByRole('button', { name: /go home/i });
      await user.click(goHomeButton);

      expect(mockReset).not.toHaveBeenCalled();
    });
  });

  describe('Development Mode', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'development';
    });

    it('should show error details in development mode', () => {
      render(<Error error={mockError} reset={mockReset} />);

      expect(screen.getByText(/View Error Details/)).toBeInTheDocument();
    });

    it('should show error name and message in details', () => {
      const error = createMockError('Specific error message');
      error.name = 'CustomError';
      
      render(<Error error={error} reset={mockReset} />);

      expect(screen.getByText(/CustomError: Specific error message/)).toBeInTheDocument();
    });

    it('should show digest in details if provided', () => {
      const errorWithDigest = createMockError('Test', { digest: 'xyz789' });
      
      render(<Error error={errorWithDigest} reset={mockReset} />);

      expect(screen.getByText('Digest:')).toBeInTheDocument();
      expect(screen.getByText('xyz789')).toBeInTheDocument();
    });

    it('should show stack trace in details if available', () => {
      const errorWithStack = createMockError('Test', { stack: 'Error: Test\n  at test.ts:10:5' });
      
      render(<Error error={errorWithStack} reset={mockReset} />);

      expect(screen.getByText('Stack Trace:')).toBeInTheDocument();
      expect(screen.getByText(/at test.ts:10:5/)).toBeInTheDocument();
    });

    it('should not show digest section if no digest', () => {
      render(<Error error={mockError} reset={mockReset} />);

      expect(screen.queryByText('Digest:')).not.toBeInTheDocument();
    });
  });

  describe('Production Mode', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'production';
    });

    it('should not show error details in production mode', () => {
      render(<Error error={mockError} reset={mockReset} />);

      expect(screen.queryByText(/View Error Details/)).not.toBeInTheDocument();
    });

    it('should not show error name in production', () => {
      const error = createMockError('Secret error message');
      
      render(<Error error={error} reset={mockReset} />);

      expect(screen.queryByText(/Secret error message/)).not.toBeInTheDocument();
    });

    it('should not show stack trace in production', () => {
      const errorWithStack = createMockError('Test', { stack: 'Sensitive stack trace' });
      
      render(<Error error={errorWithStack} reset={mockReset} />);

      expect(screen.queryByText(/Sensitive stack trace/)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle error without message', () => {
      const error = createMockError('');
      
      expect(() => {
        render(<Error error={error} reset={mockReset} />);
      }).not.toThrow();
    });

    it('should handle error without stack', () => {
      const error = createMockError('Test');
      error.stack = undefined;
      
      expect(() => {
        render(<Error error={error} reset={mockReset} />);
      }).not.toThrow();
    });

    it('should handle multiple reset calls', async () => {
      const user = userEvent.setup();
      render(<Error error={mockError} reset={mockReset} />);

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);
      await user.click(tryAgainButton);
      await user.click(tryAgainButton);

      expect(mockReset).toHaveBeenCalledTimes(3);
    });

    it('should handle error with very long message', () => {
      const longMessage = 'A'.repeat(1000);
      const error = createMockError(longMessage);
      
      render(<Error error={error} reset={mockReset} />);

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });
  });
});
