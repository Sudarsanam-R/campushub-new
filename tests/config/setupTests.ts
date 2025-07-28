// Jest setup file
import '@testing-library/jest-dom';

// Mock Next.js router
const mockPush = jest.fn();
const mockRouter = {
  route: '/',
  pathname: '',
  query: {},
  asPath: '',
  push: mockPush,
  events: {
    on: jest.fn(),
    off: jest.fn(),
  },
  beforePopState: jest.fn(() => null),
  prefetch: jest.fn(() => Promise.resolve()),
};

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockRouter.pathname,
  useSearchParams: () => new URLSearchParams(mockRouter.query as Record<string, string>),
}));

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

// Set up environment variables
const originalEnv = { ...process.env };

// Extend NodeJS.ProcessEnv interface to include our environment variables
declare global {
  namespace NodeJS {
    // Extend the existing ProcessEnv interface instead of redefining it
    interface ProcessEnv {
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      TURNSTILE_SECRET_KEY: string;
      // Other custom environment variables can be added here
      [key: string]: string | undefined;
    }
  }
}

// Set up test environment
beforeAll(() => {
  // Create a new object to avoid read-only errors
  const newEnv = { ...originalEnv };
  
  // Override specific environment variables
  (newEnv as any).NODE_ENV = 'test';
  newEnv.NEXTAUTH_URL = 'http://localhost:3000';
  newEnv.NEXTAUTH_SECRET = 'test-secret';
  newEnv.GOOGLE_CLIENT_ID = 'test-google-client-id';
  newEnv.GOOGLE_CLIENT_SECRET = 'test-google-secret';
  newEnv.TURNSTILE_SECRET_KEY = 'test-turnstile-secret';
  
  // Assign back to process.env
  Object.assign(process.env, newEnv);
});

// Clean up after tests
afterAll(() => {
  // Restore original environment variables
  Object.assign(process.env, originalEnv);
});

// Polyfill for Request and Response
class Request {
  method: string;
  url: string;
  headers: Headers;
  body: any;
  
  constructor(input: string | URL | Request, init?: RequestInit) {
    this.url = typeof input === 'string' 
      ? input 
      : input instanceof URL 
        ? input.toString()
        : input.url;
    this.method = init?.method || 'GET';
    this.headers = new Headers(init?.headers);
    this.body = init?.body;
  }
}

class Response {
  status: number;
  statusText: string;
  headers: Headers;
  body: any;
  ok: boolean;
  
  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
    this.headers = new Headers(init?.headers);
    this.body = body || null;
    this.ok = this.status >= 200 && this.status < 300;
  }
  
  async json() {
    return this.body ? JSON.parse(this.body as string) : null;
  }
}

// Mock fetch with a simple implementation
const mockFetch = jest.fn().mockImplementation(
  async (): Promise<Response> => {
    return new Response(JSON.stringify({}), { status: 200 });
  }
);

global.fetch = mockFetch;

// @ts-ignore - We're intentionally adding these to global scope for testing
global.Request = Request;
// @ts-ignore
global.Response = Response;

// Add custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
