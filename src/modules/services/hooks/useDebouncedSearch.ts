import { useState, useEffect, useRef, useMemo } from 'react';
import { userApi } from '../../../api/user.api';
import {
  ServiceSearchEngine,
  ServiceSearchItem,
} from '../search/ServiceSearchEngine';

export interface UseDebouncedSearchResult {
  query: string;
  setQuery: (q: string) => void;
  results: ServiceSearchItem[];
  isSearching: boolean;
  latencyMs: number | null;
  clearSearch: () => void;
}

export function useDebouncedSearch(
  localCatalogue: ServiceSearchItem[],
  debounceMs = 250
): UseDebouncedSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ServiceSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  // 1. Build local Fuse engine once per catalogue version (0-5 ms fast-path)
  const localEngine = useMemo(() => {
    return new ServiceSearchEngine(localCatalogue);
  }, [localCatalogue]);

  // Monotonic request ID counter to prevent out-of-order responses
  const latestRequestId = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed || trimmed.length < 2) {
      setResults(localCatalogue.slice(0, 8)); // Show initial popular items
      setIsSearching(false);
      setLatencyMs(null);
      return;
    }

    // Fast-path: immediately display local search results (0-5ms)
    const localMatches = localEngine.search(trimmed, 10);
    if (localMatches.length > 0) {
      setResults(localMatches);
    }

    setIsSearching(true);

    // Cancel prior pending in-flight HTTP request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const currentRequestId = ++latestRequestId.current;

    const timer = setTimeout(async () => {
      const startTime = Date.now();
      try {
        const remoteResults = await userApi.searchCatalog(
          trimmed,
          'en',
          abortController.signal
        );

        // Guard against race conditions: Ignore if a newer request has already fired
        if (currentRequestId === latestRequestId.current) {
          if (remoteResults && remoteResults.length > 0) {
            setResults(remoteResults);
          } else {
            // Keep local fallback if remote found 0
            setResults(localMatches);
          }
          setLatencyMs(Date.now() - startTime);
          setIsSearching(false);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && currentRequestId === latestRequestId.current) {
          // Fallback to local on network error
          setResults(localMatches);
          setIsSearching(false);
        }
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [query, localCatalogue, localEngine, debounceMs]);

  const clearSearch = () => {
    setQuery('');
    setResults(localCatalogue.slice(0, 8));
    setIsSearching(false);
  };

  return {
    query,
    setQuery,
    results,
    isSearching,
    latencyMs,
    clearSearch,
  };
}
