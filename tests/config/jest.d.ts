// Type definitions for Jest global functions
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'test' | 'development' | 'production';
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    TURNSTILE_SECRET_KEY: string;
    [key: string]: string | undefined;
  }
}

declare namespace jest {
  interface Mock<T = any, Y extends any[] = any> {
    (...args: Y): T;
    mock: {
      calls: Y[];
      results: Array<{ type: 'return' | 'throw'; value: T }>;
      instances: any[];
    };
    mockClear(): void;
    mockReset(): void;
    mockImplementation(fn: (...args: Y) => T): this;
    mockImplementationOnce(fn: (...args: Y) => T): this;
    mockName(name: string): this;
    mockReturnThis(): this;
    mockReturnValue(value: T): this;
    mockReturnValueOnce(value: T): this;
    mockResolvedValue(value: T): this;
    mockResolvedValueOnce(value: T): this;
    mockRejectedValue(value: any): this;
    mockRejectedValueOnce(value: any): this;
  }

  interface Matchers<R> {
    toBeWithinRange(floor: number, ceiling: number): R;
  }
}

// Extend the global namespace
declare global {
  // Add jest globals
  const jest: typeof import('@jest/globals').jest;
  const describe: typeof import('@jest/globals').describe;
  const it: typeof import('@jest/globals').it;
  const test: typeof import('@jest/globals').test;
  const expect: typeof import('@jest/globals').expect;
  const beforeAll: typeof import('@jest/globals').beforeAll;
  const afterAll: typeof import('@jest/globals').afterAll;
  const beforeEach: typeof import('@jest/globals').beforeEach;
  const afterEach: typeof import('@jest/globals').afterEach;
  const jest: typeof import('@jest/globals').jest;

  // Extend the global fetch type
  function fetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response>;
}
