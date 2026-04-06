/**
 * useApi Hook
 * 
 * 通用API请求Hook，提供loading状态、错误处理和重试机制
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseApiOptions<T> {
  immediate?: boolean;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
}

interface UseApiReturn<T, P extends unknown[]> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  execute: (...params: P) => Promise<T | undefined>;
  reset: () => void;
  retry: () => void;
}

export function useApi<T, P extends unknown[] = []>(
  apiFunction: (...params: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T, P> {
  const {
    immediate = false,
    initialData,
    retryCount = 0,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);
  
  const retryAttemptsRef = useRef(0);
  const paramsRef = useRef<P | null>(null);
  const mountedRef = useRef(true);
  const immediateExecutedRef = useRef(false);
  
  const apiFunctionRef = useRef(apiFunction);
  const onSuccessRef = useRef(options.onSuccess);
  const onErrorRef = useRef(options.onError);

  apiFunctionRef.current = apiFunction;
  onSuccessRef.current = options.onSuccess;
  onErrorRef.current = options.onError;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...params: P): Promise<T | undefined> => {
    if (!mountedRef.current) return;

    paramsRef.current = params;
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunctionRef.current(...params);
      if (mountedRef.current) {
        setData(result);
        retryAttemptsRef.current = 0;
        onSuccessRef.current?.(result);
        return result;
      }
    } catch (err) {
      if (!mountedRef.current) return;

      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onErrorRef.current?.(error);

      if (retryAttemptsRef.current < retryCount) {
        retryAttemptsRef.current++;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return execute(...params);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [retryCount, retryDelay]);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
    retryAttemptsRef.current = 0;
    paramsRef.current = null;
  }, [initialData]);

  const retry = useCallback(() => {
    if (paramsRef.current) {
      execute(...paramsRef.current);
    }
  }, [execute]);

  useEffect(() => {
    if (immediate && !immediateExecutedRef.current) {
      immediateExecutedRef.current = true;
      const doExecute = async () => {
        if (!mountedRef.current) return;
        
        setLoading(true);
        setError(null);
        
        try {
          const result = await apiFunctionRef.current(...([] as unknown as P));
          if (mountedRef.current) {
            setData(result);
            retryAttemptsRef.current = 0;
            onSuccessRef.current?.(result);
          }
        } catch (err) {
          if (!mountedRef.current) return;
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          onErrorRef.current?.(error);
        } finally {
          if (mountedRef.current) {
            setLoading(false);
          }
        }
      };
      doExecute();
    }
  }, [immediate]);

  return { data, loading, error, execute, reset, retry };
}
