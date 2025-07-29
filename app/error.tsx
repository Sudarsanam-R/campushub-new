'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error caught:', error);
  }, [error]);

  const handleReset = () => {
    // Attempt to recover by trying to re-render the segment
    reset();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6">
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-800">Something went wrong!</AlertTitle>
              <AlertDescription className="text-red-700">
                <p className="mb-4">
                  An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-2 text-sm">
                    <summary className="cursor-pointer font-medium mb-1 text-red-800">
                      Error details
                    </summary>
                    <div className="bg-red-100 p-3 rounded-md overflow-auto max-h-40">
                      <p className="font-mono text-sm text-red-900">
                        {error.message}
                      </p>
                      {error.digest && (
                        <p className="mt-2 text-xs text-red-800">
                          Error ID: {error.digest}
                        </p>
                      )}
                    </div>
                  </details>
                )}
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
              
              <Button
                variant="outline"
                onClick={handleGoHome}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go to home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
