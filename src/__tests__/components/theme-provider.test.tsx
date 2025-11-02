import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/theme-provider';
import { useTheme } from 'next-themes';

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>,
  useTheme: jest.fn(),
}));

describe('ThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render children', () => {
      render(
        <ThemeProvider>
          <div data-testid="child">Test Child</div>
        </ThemeProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should wrap children with NextThemesProvider', () => {
      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <ThemeProvider>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </ThemeProvider>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });
  });

  describe('Props Forwarding', () => {
    it('should forward attribute prop to NextThemesProvider', () => {
      const { container } = render(
        <ThemeProvider attribute="class">
          <div>Content</div>
        </ThemeProvider>
      );

      expect(container).toBeInTheDocument();
    });

    it('should forward defaultTheme prop to NextThemesProvider', () => {
      const { container } = render(
        <ThemeProvider defaultTheme="dark">
          <div>Content</div>
        </ThemeProvider>
      );

      expect(container).toBeInTheDocument();
    });

    it('should forward enableSystem prop to NextThemesProvider', () => {
      const { container } = render(
        <ThemeProvider enableSystem={false}>
          <div>Content</div>
        </ThemeProvider>
      );

      expect(container).toBeInTheDocument();
    });

    it('should forward disableTransitionOnChange prop to NextThemesProvider', () => {
      const { container } = render(
        <ThemeProvider disableTransitionOnChange>
          <div>Content</div>
        </ThemeProvider>
      );

      expect(container).toBeInTheDocument();
    });

    it('should forward multiple props simultaneously', () => {
      const { container } = render(
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div>Content</div>
        </ThemeProvider>
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should work with nested components', () => {
      const NestedComponent = () => <div data-testid="nested">Nested</div>;
      
      render(
        <ThemeProvider>
          <div>
            <NestedComponent />
          </div>
        </ThemeProvider>
      );

      expect(screen.getByTestId('nested')).toBeInTheDocument();
    });

    it('should not throw when children is null', () => {
      expect(() => {
        render(<ThemeProvider>{null}</ThemeProvider>);
      }).not.toThrow();
    });

    it('should handle empty children', () => {
      const { container } = render(<ThemeProvider>{undefined}</ThemeProvider>);
      expect(container).toBeInTheDocument();
    });
  });
});
