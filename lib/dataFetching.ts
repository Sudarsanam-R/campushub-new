import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface FetchOptions extends RequestInit {
  useCache?: boolean;
  cacheKey?: string;
  cacheExpiry?: number; // in milliseconds
}

interface FetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// In-memory cache
const cache = new Map<string, { data: any; expiry: number }>();

/**
 * Custom hook for data fetching with loading states and caching
 * @template T - The expected data type
 * @param {string} url - The URL to fetch data from
 * @param {FetchOptions} [options] - Fetch options including caching configuration
 * @returns {FetchResult<T>} The fetch result with data, loading state, and error
 * @example
 * const { data, isLoading, error, refetch } = useFetch<User[]>('/api/users', {
 *   useCache: true,
 *   cacheKey: 'users-list',
 *   cacheExpiry: 5 * 60 * 1000, // 5 minutes
 * });
 */
export function useFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): FetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { useCache = true, cacheKey = url, cacheExpiry = 5 * 60 * 1000 } = options;

  const fetchData = useCallback(async () => {
    // Check cache first if enabled
    if (useCache && cacheKey) {
      const cached = cache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        setData(cached.data);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Update state
      setData(result);
      
      // Update cache if enabled
      if (useCache && cacheKey) {
        cache.set(cacheKey, {
          data: result,
          expiry: Date.now() + cacheExpiry,
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      toast.error('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [url, JSON.stringify(options), useCache, cacheKey, cacheExpiry]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Clean up cache on unmount
  useEffect(() => {
    return () => {
      // Optional: Clean up expired cache entries
      const now = Date.now();
      // Convert to array first to avoid iteration issues
      Array.from(cache.entries()).forEach(([key, entry]) => {
        if (entry.expiry <= now) {
          cache.delete(key);
        }
      });
    };
  }, []);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Clears the fetch cache for a specific key or all keys
 * @param {string} [key] - Optional key to clear. If not provided, clears all cache
 */
export function clearFetchCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/**
 * Prefetches data and stores it in the cache
 * @param {string} url - The URL to prefetch
 * @param {FetchOptions} [options] - Fetch options
 * @returns {Promise<void>}
 */
export async function prefetchData(
  url: string,
  options: FetchOptions = {}
): Promise<void> {
  const { useCache = true, cacheKey = url, cacheExpiry = 5 * 60 * 1000 } = options;

  // Skip if already in cache
  if (useCache && cacheKey && cache.has(cacheKey)) {
    return;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Store in cache
    if (useCache && cacheKey) {
      cache.set(cacheKey, {
        data,
        expiry: Date.now() + cacheExpiry,
      });
    }
  } catch (error) {
    console.error('Prefetch error:', error);
  }
}
