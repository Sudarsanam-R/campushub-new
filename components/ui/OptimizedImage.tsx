import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import React from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoadingComplete'> {
  fallbackSrc?: string;
  containerClassName?: string;
  showLoadingIndicator?: boolean;
}

/**
 * An optimized image component that includes loading states and error handling
 * @component
 * @param {OptimizedImageProps} props - Component props
 * @param {string} [props.fallbackSrc] - Fallback image source if the main image fails to load
 * @param {string} [props.containerClassName] - Additional class names for the container
 * @param {boolean} [props.showLoadingIndicator=true] - Whether to show a loading indicator
 * @returns {JSX.Element} Optimized image component
 * @example
 * <OptimizedImage
 *   src="/images/example.jpg"
 *   alt="Example image"
 *   width={800}
 *   height={600}
 *   fallbackSrc="/images/fallback.jpg"
 *   className="rounded-lg shadow-md"
 * />
 */
export default function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  containerClassName = '',
  className = '',
  showLoadingIndicator = true,
  ...props
}: OptimizedImageProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // If we have an error and no fallback, return a placeholder
  if (hasError) {
    return (
      <div className={`relative bg-gray-200 ${containerClassName}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-500">Image not available</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${containerClassName}`}>
      {/* Loading indicator */}
      {isLoading && showLoadingIndicator && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Next.js Image component */}
      <Image
        src={imgSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${className} ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoadingComplete={handleLoad}
        onError={handleError}
        loading="lazy"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        {...props}
      />
    </div>
  );
}
