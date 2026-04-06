/**
 * useReminders Hook
 *
 * 提醒数据管理 Hook，获取即将到期的会员提醒。
 *
 * @module hooks/useReminders
 */

import { reminderApi } from '@/services/api';
import { useApi } from './useApi';

/**
 * 提醒管理 Hook
 * @param immediate - 是否立即获取数据，默认 true
 */
export function useReminders(immediate = true) {
  const {
    data: reminders,
    loading,
    error,
    execute: fetchReminders,
  } = useApi(
    async () => {
      const response = await reminderApi.getUpcoming();
      return response.data.data.reminders;
    },
    { immediate }
  );

  return {
    reminders: reminders || [],
    loading,
    error,
    fetchReminders,
  };
}
