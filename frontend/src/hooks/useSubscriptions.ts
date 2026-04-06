/**
 * useSubscriptions Hook
 *
 * 订阅记录管理 Hook，提供订阅的增删改查功能。
 *
 * @module hooks/useSubscriptions
 */

import { useCallback, useMemo } from 'react';
import { subscriptionApi } from '@/services/api';
import type { SubscriptionCreate, SubscriptionUpdate, SubscriptionQueryParams } from '@/types';
import { useApi } from './useApi';

/**
 * 订阅列表查询选项
 */
interface UseSubscriptionsOptions {
  /** 会员ID */
  memberId: number | null;
  /** 是否立即执行 */
  immediate?: boolean;
  /** 查询参数 */
  params?: SubscriptionQueryParams;
}

/**
 * 订阅列表管理 Hook
 * @param options - 查询选项
 */
export function useSubscriptions(options: UseSubscriptionsOptions) {
  const { memberId, params = {} } = options;

  const {
    data: subscriptionsData,
    loading,
    error,
    execute: fetchSubscriptions,
    reset,
  } = useApi(
    async (id: number, queryParams?: SubscriptionQueryParams) => {
      const response = await subscriptionApi.getByMember(id, queryParams || params);
      return response.data.data;
    },
    { immediate: false }
  );

  const createSubscription = useCallback(async (data: SubscriptionCreate) => {
    if (!memberId) return null;
    const response = await subscriptionApi.create(memberId, data);
    await fetchSubscriptions(memberId);
    return response.data.data;
  }, [memberId, fetchSubscriptions]);

  const updateSubscription = useCallback(async (id: number, data: SubscriptionUpdate) => {
    const response = await subscriptionApi.update(id, data);
    if (memberId) {
      await fetchSubscriptions(memberId);
    }
    return response.data.data;
  }, [memberId, fetchSubscriptions]);

  const deleteSubscription = useCallback(async (id: number) => {
    await subscriptionApi.delete(id);
    if (memberId) {
      await fetchSubscriptions(memberId);
    }
  }, [memberId, fetchSubscriptions]);

  const subscriptions = useMemo(() => subscriptionsData?.items || [], [subscriptionsData]);
  const total = useMemo(() => subscriptionsData?.total || 0, [subscriptionsData]);

  return {
    subscriptions,
    total,
    loading,
    error,
    fetchSubscriptions: memberId ? () => fetchSubscriptions(memberId) : undefined,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    reset,
  };
}

/**
 * 单个订阅管理 Hook
 * @param id - 订阅ID
 */
export function useSubscription(id: number | null) {
  const {
    data: subscription,
    loading,
    error,
    execute: fetchSubscription,
  } = useApi(async (subscriptionId: number) => {
    const response = await subscriptionApi.getById(subscriptionId);
    return response.data.data;
  });

  const updateSubscription = useCallback(async (data: SubscriptionUpdate) => {
    if (!id) return null;
    const response = await subscriptionApi.update(id, data);
    await fetchSubscription(id);
    return response.data.data;
  }, [id, fetchSubscription]);

  return {
    subscription,
    loading,
    error,
    fetchSubscription: id ? () => fetchSubscription(id) : undefined,
    updateSubscription,
  };
}