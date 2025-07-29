import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { AppError, formatError } from '@/lib/errors';

// Middleware to handle errors and authentication
export async function errorHandler(
  req: NextRequest,
  next: () => Promise<NextResponse>
) {
  try {
    // Skip error handling for API routes (they have their own error handling)
    if (req.nextUrl.pathname.startsWith('/api')) {
      return next();
    }

    // Check authentication for protected routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      
      if (!token) {
        const url = new URL('/login', req.url);
        url.searchParams.set('callbackUrl', req.nextUrl.pathname);
        return NextResponse.redirect(url);
      }

      // Check admin role for admin routes
      if (req.nextUrl.pathname.startsWith('/admin') && !['ADMIN', 'SUPER_ADMIN'].includes(token.role)) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Continue with the request
    return next();
  } catch (error) {
    console.error('Middleware error:', error);

    // Handle known error types
    if (error instanceof AppError) {
      const errorResponse = formatError(error);
      
      // For API routes, return JSON response
      if (req.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
      }
      
      // For pages, redirect to error page
      const url = new URL(`/error?code=${errorResponse.statusCode}`, req.url);
      return NextResponse.redirect(url);
    }

    // Handle unknown errors
    const errorResponse = formatError(error);
    
    if (req.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
    }
    
    const url = new URL(`/error?code=${errorResponse.statusCode}`, req.url);
    return NextResponse.redirect(url);
  }
}

// Middleware to validate request body against a schema
export function validateRequest(schema: any) {
  return async (req: NextRequest, next: () => Promise<NextResponse>) => {
    try {
      let data;
      
      // Parse request body based on content type
      const contentType = req.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        data = await req.json();
      } else if (contentType.includes('application/x-www-form-urlencoded') || 
                contentType.includes('multipart/form-data')) {
        const formData = await req.formData();
        data = Object.fromEntries(formData.entries());
      } else {
        data = {};
      }

      // Validate data against schema
      const validatedData = await schema.parseAsync(data);
      
      // Add validated data to request object
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-validated-data', JSON.stringify(validatedData));
      
      // Create a new request with the validated data
      const newReq = new NextRequest(req, {
        headers: requestHeaders,
      });
      
      // Continue with the validated request
      return next();
      
    } catch (error) {
      console.error('Validation error:', error);
      
      if (error instanceof z.ZodError) {
        const formattedErrors = formatValidationErrors(error);
        
        if (req.nextUrl.pathname.startsWith('/api')) {
          return NextResponse.json({
            status: 'error',
            statusCode: 400,
            message: 'Validation failed',
            errors: formattedErrors,
          }, { status: 400 });
        }
        
        // For pages, you might want to redirect to a form with error messages
        const url = new URL(req.nextUrl.pathname, req.url);
        url.searchParams.set('error', 'validation_failed');
        return NextResponse.redirect(url);
      }
      
      // For other errors, use the global error handler
      throw error;
    }
  };
}

// Helper function to format Zod validation errors
function formatValidationErrors(error: z.ZodError) {
  const formattedErrors: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    formattedErrors[path] = err.message;
  });
  
  return formattedErrors;
}

// Export middleware for use in Next.js config
export const middleware = {
  errorHandler,
  validateRequest,
};
