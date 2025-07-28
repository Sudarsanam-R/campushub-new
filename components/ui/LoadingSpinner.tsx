import { cn } from '../../lib/utils';

import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'muted';
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-4',
  lg: 'h-12 w-12 border-4',
};

const colorMap = {
  primary: 'border-t-blue-500',
  white: 'border-t-white',
  muted: 'border-t-gray-400',
};

/**
 * A customizable loading spinner component
 * @component
 * @param {LoadingSpinnerProps} props - Component props
 * @param {string} [props.className] - Additional class names
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size of the spinner
 * @param {'primary'|'white'|'muted'} [props.color='primary'] - Color of the spinner
 * @returns {JSX.Element} Loading spinner component
 * @example
 * <LoadingSpinner size="md" color="primary" className="my-4" />
 */
export function LoadingSpinner({
  className,
  size = 'md',
  color = 'primary',
}: LoadingSpinnerProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-solid border-transparent',
        sizeMap[size],
        colorMap[color],
        className
      )}
      role="status"
      aria-label="Loading..."
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * A full-page loading overlay
 * @component
 * @param {object} props - Component props
 * @param {string} [props.message] - Optional loading message
 * @returns {JSX.Element} Full page loading component
 * @example
 * <PageLoading message="Loading application..." />
 */
export function PageLoading({ message = 'Loading...' }: { message?: string }): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <LoadingSpinner size="lg" className="mb-4" />
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  );
}
/**
 * A loading skeleton component for content placeholders
 * @component
 * @param {object} props - Component props
 * @param {number} [props.rows=3] - Number of skeleton rows
 * @param {boolean} [props.circular=false] - Whether to show circular avatars
 * @returns {JSX.Element} Skeleton loading component
 * @example
 * <SkeletonLoader rows={4} circular />
 */
export function SkeletonLoader({
  rows = 3,
  circular = false,
}: {
  rows?: number;
  circular?: boolean;
}): React.JSX.Element {
  return (
    <div className="w-full space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          {circular && (
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
          )}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
