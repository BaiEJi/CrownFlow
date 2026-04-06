import { useState, useEffect, useCallback, useRef } from 'react';
import dayjs from 'dayjs';

interface HolidayInfo {
  date: string;
  name: string;
  holiday: boolean;
}

const CACHE_KEY_PREFIX = 'crownflow_holidays_';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

const cache: Record<number, Record<string, HolidayInfo>> = {};

function getCachedYear(year: number): Record<string, HolidayInfo> | null {
  const raw = localStorage.getItem(CACHE_KEY_PREFIX + year);
  if (!raw) return null;
  try {
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY_PREFIX + year);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCachedYear(year: number, data: Record<string, HolidayInfo>) {
  localStorage.setItem(CACHE_KEY_PREFIX + year, JSON.stringify({ data, ts: Date.now() }));
}

export function useHolidays(year?: number) {
  const targetYear = year ?? dayjs().year();
  const [holidays, setHolidays] = useState<Record<string, HolidayInfo>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchedRef = useRef<Set<number>>(new Set());

  const fetchYear = useCallback(async (y: number) => {
    if (cache[y]) {
      setHolidays(prev => ({ ...prev, ...cache[y] }));
      return;
    }
    const cached = getCachedYear(y);
    if (cached) {
      cache[y] = cached;
      setHolidays(prev => ({ ...prev, ...cached }));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://timor.tech/api/holiday/year/${y}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.code !== 0) throw new Error('API error');

      const mapped: Record<string, HolidayInfo> = {};
      for (const [, val] of Object.entries(json.holiday as Record<string, {
        date: string;
        name: string;
        holiday: boolean;
      }>) ) {
        mapped[val.date] = {
          date: val.date,
          name: val.name,
          holiday: val.holiday,
        };
      }
      cache[y] = mapped;
      setCachedYear(y, mapped);
      setHolidays(prev => ({ ...prev, ...mapped }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const yearsToFetch = [targetYear - 1, targetYear, targetYear + 1];
    for (const y of yearsToFetch) {
      if (!fetchedRef.current.has(y)) {
        fetchedRef.current.add(y);
        fetchYear(y);
      }
    }
  }, [targetYear, fetchYear]);

  const getDayInfo = useCallback((date: string | dayjs.Dayjs): {
    isWeekend: boolean;
    isHoliday: boolean;
    isWorkday: boolean;
    isRestDay: boolean;
    holidayName?: string;
  } => {
    const d = dayjs(date);
    const dateStr = d.format('YYYY-MM-DD');
    const dow = d.day();
    const isWeekend = dow === 0 || dow === 6;
    const info = holidays[dateStr];

    if (info) {
      return {
        isWeekend,
        isHoliday: info.holiday,
        isWorkday: !info.holiday,
        isRestDay: info.holiday,
        holidayName: info.name,
      };
    }

    return {
      isWeekend,
      isHoliday: false,
      isWorkday: !isWeekend,
      isRestDay: isWeekend,
      holidayName: undefined,
    };
  }, [holidays]);

  return { holidays, loading, error, getDayInfo, fetchYear };
}
