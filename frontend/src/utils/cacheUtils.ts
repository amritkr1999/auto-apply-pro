/**
 * Utility for client-side API response caching with TTL (Time-To-Live).
 * Helps render data instantly on slow internet connections.
 */

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

export const getCachedData = <T>(key: string, ttlMs: number = 300000): T | null => {
  try {
    const raw = localStorage.getItem(`cache_${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    const now = Date.now();
    if (now - entry.timestamp > ttlMs) {
      // Stale data
      return null;
    }
    return entry.data;
  } catch (e) {
    console.warn(`Failed to read cache for key: ${key}`, e);
    return null;
  }
};

export const setCachedData = <T>(key: string, data: T): void => {
  try {
    const entry: CacheEntry<T> = {
      timestamp: Date.now(),
      data,
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
  } catch (e) {
    console.warn(`Failed to write cache for key: ${key}`, e);
  }
};

export const clearCachedData = (key: string): void => {
  try {
    localStorage.removeItem(`cache_${key}`);
  } catch {
    // Ignore error
  }
};

/**
 * Executes an async fetcher with Stale-While-Revalidate caching pattern.
 * Instantly invokes `onData` with cached data if available, then fetches fresh data.
 */
export const fetchWithCache = async <T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  onData: (data: T, isFromCache: boolean) => void,
  ttlMs: number = 300000
): Promise<T> => {
  const cached = getCachedData<T>(cacheKey, ttlMs);
  if (cached !== null) {
    onData(cached, true);
  }

  try {
    const freshData = await fetcher();
    setCachedData(cacheKey, freshData);
    onData(freshData, false);
    return freshData;
  } catch (err) {
    if (cached !== null) {
      console.warn(`Using cached fallback for ${cacheKey} due to fetch error:`, err);
      return cached;
    }
    throw err;
  }
};
