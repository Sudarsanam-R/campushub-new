import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { NextIntlProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';

type AllTheProvidersProps = {
  children: React.ReactNode;
};

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  return (
    <NextIntlProvider locale="en" messages={{}}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {children}
      </ThemeProvider>
    </NextIntlProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock next/router
export const mockRouter = {
  route: '/',
  pathname: '',
  query: {},
  asPath: '',
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(() => Promise.resolve()),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
};

// Mock next/head
export const mockHead = (props: { children: React.ReactNode }) => {
  return <>{props.children}</>;
};

// Mock next/image
export const mockImage = (props: any) => {
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return <img {...props} />;
};

// Mock fetch
export const mockFetch = (
  response: any = {},
  options: {
    ok?: boolean;
    status?: number;
    statusText?: string;
  } = {}
) => {
  const { ok = true, status = 200, statusText = 'OK' } = options;
  
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok,
      status,
      statusText,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    })
  );
};
