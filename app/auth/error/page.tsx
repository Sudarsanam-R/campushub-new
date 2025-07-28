'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { OAuthErrorType } from '@/utils/oauth';

// Map error types to user-friendly messages
const errorMessages: Record<string, { title: string; message: string }> = {
  [OAuthErrorType.AccessDenied]: {
    title: 'Access Denied',
    message: 'You do not have permission to sign in.',
  },
  [OAuthErrorType.OAuthCallbackError]: {
    title: 'Authentication Error',
    message: 'An error occurred during authentication. Please try again.',
  },
  [OAuthErrorType.OAuthAccountNotLinked]: {
    title: 'Account Not Linked',
    message: 'This email is already associated with another account. Please sign in with the original provider.',
  },
  [OAuthErrorType.SessionRequired]: {
    title: 'Sign In Required',
    message: 'You must be signed in to access this page.',
  },
  [OAuthErrorType.UnsupportedProvider]: {
    title: 'Unsupported Provider',
    message: 'The selected authentication provider is not supported.',
  },
  [OAuthErrorType.InvalidCSRF]: {
    title: 'Security Error',
    message: 'Invalid security token. Please try again.',
  },
  default: {
    title: 'Authentication Error',
    message: 'An unexpected error occurred during authentication. Please try again.',
  },
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorType = searchParams.get('type') as OAuthErrorType | null;
  const provider = searchParams.get('provider');

  // Get the appropriate error message
  const getErrorMessage = () => {
    if (errorType && errorMessages[errorType]) {
      return errorMessages[errorType];
    }
    return errorMessages.default;
  };

  const { title, message } = getErrorMessage();

  // Log the error for debugging
  useEffect(() => {
    if (error) {
      console.error('Authentication error:', {
        error,
        errorType,
        provider,
        timestamp: new Date().toISOString(),
      });
    }
  }, [error, errorType, provider]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {title}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {message}
            </p>
            {error && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-500 break-all">
                  Error details: {error}
                </p>
              </div>
            )}
            <div className="mt-6">
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return to sign in
              </Link>
            </div>
            <div className="mt-4">
              <Link
                href="/"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Go back home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
