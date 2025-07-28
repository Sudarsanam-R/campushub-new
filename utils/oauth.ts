import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// OAuth error types
export enum OAuthErrorType {
  AccessDenied = 'AccessDenied',
  OAuthCallbackError = 'OAuthCallbackError',
  OAuthSigninError = 'OAuthSigninError',
  OAuthAccountNotLinked = 'OAuthAccountNotLinked',
  EmailSigninError = 'EmailSigninError',
  CredentialsSigninError = 'CredentialsSigninError',
  SessionRequired = 'SessionRequired',
  OAuthCreateAccountError = 'OAuthCreateAccountError',
  EmailCreateAccountError = 'EmailCreateAccountError',
  CallbackRouteError = 'CallbackRouteError',
  OAuthProfileError = 'OAuthProfileError',
  InvalidProvider = 'InvalidProvider',
  InvalidState = 'InvalidState',
  MissingAuthorization = 'MissingAuthorization',
  InvalidAuthorization = 'InvalidAuthorization',
  InvalidCallbackUrl = 'InvalidCallbackUrl',
  InvalidCheck = 'InvalidCheck',
  MissingAdapter = 'MissingAdapter',
  MissingAuthorize = 'MissingAuthorize',
  MissingSecret = 'MissingSecret',
  MissingProviders = 'MissingProviders',
  MissingUrl = 'MissingUrl',
  MissingAdapterMethods = 'MissingAdapterMethods',
  InvalidJWT = 'InvalidJWT',
  InvalidProviderId = 'InvalidProviderId',
  InvalidVerificationToken = 'InvalidVerificationToken',
  InvalidCSRF = 'InvalidCSRF',
  MissingCSRF = 'MissingCSRF',
  MissingEmail = 'MissingEmail',
  MissingPassword = 'MissingPassword',
  MissingUsername = 'MissingUsername',
  OAuthProfileParseError = 'OAuthProfileParseError',
  OAuthProfileValidationError = 'OAuthProfileValidationError',
  UnsupportedProvider = 'UnsupportedProvider',
  UnknownError = 'UnknownError',
}

// OAuth error handler
export class OAuthError extends Error {
  type: OAuthErrorType;
  code: string;
  provider?: string;

  constructor(
    message: string,
    type: OAuthErrorType = OAuthErrorType.UnknownError,
    provider?: string,
    code: string = type
  ) {
    super(message);
    this.name = 'OAuthError';
    this.type = type;
    this.code = code;
    this.provider = provider;
    
    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OAuthError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      code: this.code,
      provider: this.provider,
    };
  }
}

// Map OAuth provider to display name
const providerMap: Record<string, string> = {
  google: 'Google',
  github: 'GitHub',
  // Add more providers as needed
};

// Get provider display name
export const getProviderName = (providerId: string): string => {
  return providerMap[providerId.toLowerCase()] || providerId;
};

// Handle OAuth errors
export const handleOAuthError = (error: unknown, provider?: string): NextResponse => {
  console.error('OAuth Error:', error);
  
  let errorMessage = 'An error occurred during authentication';
  let errorType = OAuthErrorType.UnknownError;
  let statusCode = 500;

  if (error instanceof OAuthError) {
    errorMessage = error.message;
    errorType = error.type;
    provider = error.provider || provider;
    
    // Set appropriate status codes based on error type
    switch (errorType) {
      case OAuthErrorType.AccessDenied:
      case OAuthErrorType.MissingAuthorization:
      case OAuthErrorType.InvalidAuthorization:
        statusCode = 401;
        break;
      case OAuthErrorType.InvalidCSRF:
      case OAuthErrorType.InvalidState:
      case OAuthErrorType.MissingCSRF:
        statusCode = 403;
        break;
      case OAuthErrorType.OAuthAccountNotLinked:
      case OAuthErrorType.InvalidProvider:
      case OAuthErrorType.UnsupportedProvider:
        statusCode = 400;
        break;
      default:
        statusCode = 500;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  // Log the error for debugging
  console.error(`OAuth Error (${provider || 'unknown-provider'}):`, {
    errorType,
    message: errorMessage,
    statusCode,
  });

  // Return a user-friendly error response
  return NextResponse.json(
    {
      error: errorMessage,
      code: errorType,
      provider: provider ? getProviderName(provider) : undefined,
    },
    { status: statusCode }
  );
};

// Validate OAuth provider
export const validateOAuthProvider = (provider: string): boolean => {
  const validProviders = Object.keys(providerMap).map(p => p.toLowerCase());
  return validProviders.includes(provider.toLowerCase());
};

// Middleware to protect OAuth callback routes
export const withOAuthProtection = (handler: Function) => {
  return async (request: NextRequest, ...args: any) => {
    try {
      // Verify the session
      const session = await getToken({ req: request });
      
      if (!session) {
        throw new OAuthError(
          'You must be signed in to access this resource',
          OAuthErrorType.SessionRequired
        );
      }

      // Get provider from URL or request body
      const provider = request.nextUrl.searchParams.get('provider') || 
                     (await request.json())?.provider;
      
      if (!provider) {
        throw new OAuthError(
          'Authentication provider is required',
          OAuthErrorType.MissingProviders
        );
      }

      // Validate the provider
      if (!validateOAuthProvider(provider)) {
        throw new OAuthError(
          `Unsupported authentication provider: ${provider}`,
          OAuthErrorType.UnsupportedProvider,
          provider
        );
      }

      // Add provider to request for use in the handler
      request.provider = provider;
      
      return handler(request, ...args);
    } catch (error) {
      return handleOAuthError(error);
    }
  };
};

// Extend NextRequest type to include provider
declare module 'next/server' {
  interface NextRequest {
    provider?: string;
  }
}

// Utility to get OAuth authorization URL
export const getOAuthAuthorizationUrl = (provider: string, callbackUrl: string): string => {
  if (!validateOAuthProvider(provider)) {
    throw new OAuthError(
      `Unsupported authentication provider: ${provider}`,
      OAuthErrorType.UnsupportedProvider,
      provider
    );
  }

  // In a real app, you would generate the proper OAuth URL based on the provider
  // This is a simplified example
  return `/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
};

// Utility to handle OAuth callback
export const handleOAuthCallback = async (
  provider: string, 
  code: string, 
  state: string
) => {
  try {
    if (!validateOAuthProvider(provider)) {
      throw new OAuthError(
        `Unsupported authentication provider: ${provider}`,
        OAuthErrorType.UnsupportedProvider,
        provider
      );
    }

    // In a real app, you would exchange the authorization code for an access token
    // and then fetch the user's profile from the provider's API
    // This is a simplified example
    const response = await fetch(`/api/auth/callback/${provider}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, state }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new OAuthError(
        error.message || 'Failed to authenticate with provider',
        error.type || OAuthErrorType.OAuthCallbackError,
        provider
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof OAuthError) throw error;
    throw new OAuthError(
      'An error occurred during OAuth callback',
      OAuthErrorType.OAuthCallbackError,
      provider,
      'oauth_callback_error'
    );
  }
};
