/**
 * useMembers Hook
 *
 * 会员数据管理 Hook，提供会员的增删改查功能。
 *
 * @module hooks/useMembers
 */

import { useCallback, useMemo } from 'react';
import { memberApi } from '@/services/api';
import type { MemberCreate, MemberUpdate, MemberQueryParams } from '@/types';
import { useApi } from './useApi';

/**
 * 会员列表查询选项
 */
interface UseMembersOptions {
  /** 是否立即执行 */
  immediate?: boolean;
  /** 查询参数 */
  params?: MemberQueryParams;
}

/**
 * 会员列表管理 Hook
 * @param options - 查询选项
 */
export function useMembers(options: UseMembersOptions = {}) {
  const { immediate = false, params = {} } = options;

  const {
    data: membersData,
    loading,
    error,
    execute: fetchMembers,
    reset,
  } = useApi(
    async (queryParams?: MemberQueryParams) => {
      const response = await memberApi.getAll(queryParams || params);
      return response.data.data;
    },
    { immediate }
  );

  const createMember = useCallback(async (data: MemberCreate) => {
    const response = await memberApi.create(data);
    await fetchMembers();
    return response.data.data;
  }, [fetchMembers]);

  const updateMember = useCallback(async (id: number, data: MemberUpdate) => {
    const response = await memberApi.update(id, data);
    await fetchMembers();
    return response.data.data;
  }, [fetchMembers]);

  const deleteMember = useCallback(async (id: number) => {
    await memberApi.delete(id);
    await fetchMembers();
  }, [fetchMembers]);

  const members = useMemo(() => membersData?.items || [], [membersData]);
  const total = useMemo(() => membersData?.total || 0, [membersData]);

  return {
    members,
    total,
    loading,
    error,
    fetchMembers,
    createMember,
    updateMember,
    deleteMember,
    reset,
  };
}

/**
 * 单个会员管理 Hook
 * @param id - 会员ID
 */
export function useMember(id: number | null) {
  const {
    data: member,
    loading,
    error,
    execute: fetchMember,
  } = useApi(async (memberId: number) => {
    const response = await memberApi.getById(memberId);
    return response.data.data;
  });

  const updateMember = useCallback(async (data: MemberUpdate) => {
    if (!id) return;
    const response = await memberApi.update(id, data);
    await fetchMember(id);
    return response.data.data;
  }, [id, fetchMember]);

  return {
    member,
    loading,
    error,
    fetchMember: id ? () => fetchMember(id) : undefined,
    updateMember,
  };
}
