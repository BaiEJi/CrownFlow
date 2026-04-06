/**
 * useStats Hook
 *
 * 统计数据管理 Hook，提供概览、支出、分类统计和趋势数据的获取功能。
 *
 * @module hooks/useStats
 */

import { useCallback } from 'react';
import { statsApi } from '@/services/api';
import type { SpendingQueryParams, TrendQueryParams } from '@/types';
import { useApi } from './useApi';

export function useOverview(immediate = true) {
  const apiFunction = useCallback(async () => {
    const response = await statsApi.getOverview();
    return response.data.data;
  }, []);

  const {
    data: overview,
    loading,
    error,
    execute: fetchOverview,
  } = useApi(apiFunction, { immediate });

  return {
    overview,
    loading,
    error,
    fetchOverview,
  };
}

export function useSpending(params: SpendingQueryParams, immediate = false) {
  const apiFunction = useCallback(async (queryParams: SpendingQueryParams) => {
    const response = await statsApi.getSpending(queryParams);
    return response.data.data;
  }, []);

  const {
    data: spending,
    loading,
    error,
    execute,
  } = useApi(apiFunction, { immediate });

  const fetchSpending = useCallback(() => {
    return execute(params);
  }, [execute, params]);

  return {
    spending,
    loading,
    error,
    fetchSpending,
  };
}

export function useCategoryStats(params: SpendingQueryParams, immediate = false) {
  const apiFunction = useCallback(async (queryParams: SpendingQueryParams) => {
    const response = await statsApi.getByCategory(queryParams);
    return response.data.data;
  }, []);

  const {
    data: categoryStats,
    loading,
    error,
    execute,
  } = useApi(apiFunction, { immediate });

  const fetchCategoryStats = useCallback(() => {
    return execute(params);
  }, [execute, params]);

  return {
    categoryStats,
    loading,
    error,
    fetchCategoryStats,
  };
}

export function useTrend(params: TrendQueryParams, immediate = false) {
  const apiFunction = useCallback(async (queryParams: TrendQueryParams) => {
    const response = await statsApi.getTrend(queryParams);
    return response.data.data;
  }, []);

  const {
    data: trend,
    loading,
    error,
    execute,
  } = useApi(apiFunction, { immediate });

  const fetchTrend = useCallback(() => {
    return execute(params);
  }, [execute, params]);

  return {
    trend,
    loading,
    error,
    fetchTrend,
  };
}
