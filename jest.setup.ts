import '@testing-library/jest-dom';

// Mock environment variables
process.env.GOOGLE_GENAI_API_KEY = 'test-api-key-mock';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(7),
  },
});

// Mock TextEncoder and TextDecoder for jsPDF
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock lucide-react icons as React components
jest.mock('lucide-react', () => {
  const React = require('react');
  return new Proxy({}, {
    get: (target, prop) => {
      return React.forwardRef((props: any, ref: any) =>
        React.createElement('svg', { ...props, ref, 'data-lucide': prop.toString() })
      );
    }
  });
});

// Mock pdfjs-dist to avoid import.meta errors
jest.mock('pdfjs-dist', () => ({
  getDocument: jest.fn(() => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: jest.fn(() => 
        Promise.resolve({
          getTextContent: jest.fn(() => 
            Promise.resolve({
              items: [{ str: 'Mocked PDF content' }],
            })
          ),
        })
      ),
    }),
  })),
  GlobalWorkerOptions: {
    workerSrc: '',
  },
  version: '4.0.0',
}));

// Mock jsPDF
jest.mock('jspdf', () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    text: jest.fn(),
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    setTextColor: jest.fn(),
    save: jest.fn(),
    addPage: jest.fn(),
    splitTextToSize: jest.fn((text: string) => [text]),
    internal: {
      pageSize: {
        getWidth: jest.fn(() => 210),
        getHeight: jest.fn(() => 297),
      },
    },
  })),
}));

// Suppress console errors and warnings in tests
const originalError = console.error;
const originalWarn = console.warn;

// Create a jest spy that filters expected errors
console.error = jest.fn((...args: any[]) => {
  const errorMessage = args[0]?.toString() || '';
  
  // Suppress React error boundary errors that are expected in tests
  if (
    errorMessage.includes('Error: Uncaught') ||
    errorMessage.includes('The above error occurred') ||
    errorMessage.includes('React will try to recreate') ||
    errorMessage.includes('Consider adding an error boundary') ||
    errorMessage.includes('Not implemented: navigation') ||
    errorMessage.includes('ErrorBoundary caught an error')
  ) {
    return; // Suppress these specific errors
  }
  
  // Allow other errors through for debugging
  originalError.apply(console, args);
});

// Create a jest spy that filters expected warnings
console.warn = jest.fn((...args: any[]) => {
  const warnMessage = args[0]?.toString() || '';
  
  // Suppress jsdom warnings
  if (
    warnMessage.includes('Not implemented') ||
    warnMessage.includes('navigation')
  ) {
    return; // Suppress jsdom warnings
  }
  
  // Allow other warnings through for debugging
  originalWarn.apply(console, args);
});
