// Import jest-dom for better test assertions
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock Next.js router
const mockPush = jest.fn<() => Promise<boolean>>();
const mockRouter = {
  route: '/',
  pathname: '',
  query: {},
  asPath: '',
  push: mockPush,
  events: {
    on: jest.fn<() => void>(),
    off: jest.fn<() => void>(),
  },
  beforePopState: jest.fn<() => null>(),
  prefetch: jest.fn<() => Promise<undefined>>(),
};

// Mock Next.js navigation
const mockNavigation = {
  useRouter: () => mockRouter,
  usePathname: () => mockRouter.pathname,
  useSearchParams: () => new URLSearchParams(mockRouter.query as Record<string, string>),
};

jest.mock('next/navigation', () => mockNavigation);

// Mock Next.js headers
const mockHeaders = () => ({
  get: (name: string) => {
    if (name === 'x-forwarded-for') return '127.0.0.1';
    return null;
  },
});

jest.mock('next/headers', () => ({
  headers: mockHeaders,
}));

// Set up test environment
beforeAll(() => {
  // Environment variables are now handled in jest.global-setup.ts
});

// Clean up after tests
afterAll(() => {
  // Cleanup code if needed
  jest.clearAllMocks();
});

// Mock fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Extend expect with custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}

// Add custom matchers
const matchers = {
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
};

expect.extend(matchers);
