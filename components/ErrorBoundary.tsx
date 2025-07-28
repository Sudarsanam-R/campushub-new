import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log error to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-6 text-center">
          <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-lg">
            <div className="mb-6 flex justify-center">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">
              Something went wrong
            </h2>
            <p className="mb-6 text-gray-600">
              We're sorry, but an unexpected error occurred. Please try again or
              contact support if the problem persists.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 overflow-hidden rounded-lg bg-gray-100 p-4 text-left">
                <summary className="mb-2 cursor-pointer font-medium text-gray-700">
                  Error Details
                </summary>
                <pre className="whitespace-pre-wrap break-words text-sm text-red-600">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <Button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage with function components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<{ error: Error | null; reset: () => void }>,
  onError?: (error: Error, info: ErrorInfo) => void
) => {
  return (props: P) => {
    const errorBoundaryRef = React.useRef<ErrorBoundary>(null);
    
    const handleError = (error: Error, info: ErrorInfo) => {
      console.error('Error in component:', error, info);
      if (onError) {
        onError(error, info);
      }
    };

    const reset = () => {
      if (errorBoundaryRef.current) {
        errorBoundaryRef.current.handleReset();
      }
    };

    const fallback = FallbackComponent ? (
      <FallbackComponent error={null} reset={reset} />
    ) : undefined;

    return (
      <ErrorBoundary
        ref={errorBoundaryRef}
        fallback={fallback}
        onReset={reset}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};
