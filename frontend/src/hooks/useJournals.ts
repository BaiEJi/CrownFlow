/**
 * useJournals Hook
 *
 * 日记数据管理 Hook，提供日记的增删改查功能。
 */

import { useCallback, useMemo } from 'react';
import { journalService } from '@/services/journalApi';
import type { JournalCreate, JournalUpdate, JournalQueryParams, EventCreate, EventUpdate, ReflectionCreate, ReflectionUpdate } from '@/types/journal';
import { useApi } from './useApi';

export function useJournals(options: { immediate?: boolean; params?: JournalQueryParams } = {}) {
  const { immediate = false, params = {} } = options;

  const {
    data: journalsData,
    loading,
    error,
    execute: fetchJournals,
    reset,
  } = useApi(
    async (queryParams?: JournalQueryParams) => {
      const response = await journalService.getJournals(queryParams || params);
      return response.data.data;
    },
    { immediate }
  );

  const createJournal = useCallback(async (data: JournalCreate) => {
    const response = await journalService.createJournal(data);
    await fetchJournals();
    return response.data.data;
  }, [fetchJournals]);

  const updateJournal = useCallback(async (id: number, data: JournalUpdate) => {
    const response = await journalService.updateJournal(id, data);
    await fetchJournals();
    return response.data.data;
  }, [fetchJournals]);

  const deleteJournal = useCallback(async (id: number) => {
    await journalService.deleteJournal(id);
    await fetchJournals();
  }, [fetchJournals]);

  const journals = useMemo(() => journalsData?.items || [], [journalsData]);
  const total = useMemo(() => journalsData?.total || 0, [journalsData]);

  return {
    journals,
    total,
    loading,
    error,
    fetchJournals,
    createJournal,
    updateJournal,
    deleteJournal,
    reset,
  };
}

export function useJournal(date: string | null) {
  const {
    data: journal,
    loading,
    error,
    execute: fetchJournal,
  } = useApi(async (journalDate: string) => {
    const response = await journalService.getJournalByDate(journalDate);
    return response.data.data;
  });

  const updateJournal = useCallback(async (id: number, data: JournalUpdate) => {
    const response = await journalService.updateJournal(id, data);
    if (date) await fetchJournal(date);
    return response.data.data;
  }, [date, fetchJournal]);

  return {
    journal,
    loading,
    error,
    fetchJournal: date ? () => fetchJournal(date) : undefined,
    updateJournal,
  };
}

export function useJournalEvents(date: string | null) {
  const { journal, loading, error, fetchJournal } = useJournal(date);

  const events = useMemo(() => journal?.events || [], [journal]);

  const createEvent = useCallback(async (eventData: EventCreate) => {
    if (!date) return;
    const response = await journalService.createEvent(date, eventData);
    await fetchJournal?.();
    return response.data.data;
  }, [date, fetchJournal]);

  const updateEvent = useCallback(async (eventId: number, eventData: EventUpdate) => {
    const response = await journalService.updateEvent(eventId, eventData);
    await fetchJournal?.();
    return response.data.data;
  }, [fetchJournal]);

  const deleteEvent = useCallback(async (eventId: number) => {
    await journalService.deleteEvent(eventId);
    await fetchJournal?.();
  }, [fetchJournal]);

  return {
    journal,
    events,
    loading,
    error,
    fetchJournal,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}

export function useReflections(eventId: number | null) {
  const createReflection = useCallback(async (data: ReflectionCreate) => {
    if (!eventId) return;
    const response = await journalService.createReflection(eventId, data);
    return response.data.data;
  }, [eventId]);

  const updateReflection = useCallback(async (id: number, data: ReflectionUpdate) => {
    const response = await journalService.updateReflection(id, data);
    return response.data.data;
  }, []);

  const deleteReflection = useCallback(async (id: number) => {
    await journalService.deleteReflection(id);
  }, []);

  return {
    createReflection,
    updateReflection,
    deleteReflection,
  };
}