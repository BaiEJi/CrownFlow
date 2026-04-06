/**
 * useDebounce Hook
 *
 * 防抖 Hook，用于延迟执行函数和延迟更新值。
 *
 * @module hooks/useDebounce
 */

import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * 防抖函数 Hook
 * @param callback - 要执行的回调函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function useDebounce<T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number
): (...args: T) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
}

/**
 * 防抖值 Hook
 * @param value - 要防抖的值
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的值
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
