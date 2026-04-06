/**
 * 日记 API 服务模块
 *
 * 封装日记相关的 API 请求。
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  JournalApiResponse,
  Journal,
  JournalCreate,
  JournalUpdate,
  JournalListResponse,
  JournalQueryParams,
  JournalEvent,
  EventCreate,
  EventUpdate,
  Reflection,
  ReflectionCreate,
  ReflectionUpdate,
} from '@/types/journal';

const isDev = import.meta.env.DEV;

const JOURNAL_API_BASE_URL = '/journal-api';

const journalApi = axios.create({
  baseURL: JOURNAL_API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

journalApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    config.headers['X-Request-ID'] = requestId;

    const auth = localStorage.getItem('auth');
    if (auth) {
      config.headers['Authorization'] = `Basic ${auth}`;
    }

    if (isDev) {
      console.log(`[Journal API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        requestId,
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

journalApi.interceptors.response.use(
  (response) => {
    if (isDev) {
      console.log(`[Journal API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    if (response.data.code && response.data.code !== 200 && response.data.code !== 201) {
      throw new Error(response.data.message || '请求失败');
    }

    return response;
  },
  (error: AxiosError<JournalApiResponse>) => {
    if (isDev) {
      console.error(`[Journal API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        message: error.message,
        response: error.response?.data,
      });
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('auth');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    throw error;
  }
);

export const journalService = {
  getJournals: (params?: JournalQueryParams) =>
    journalApi.get<JournalApiResponse<JournalListResponse>>('/journals', { params }),

  getJournalByDate: (date: string) =>
    journalApi.get<JournalApiResponse<Journal>>(`/journals/${date}`),

  createJournal: (data: JournalCreate) =>
    journalApi.post<JournalApiResponse<Journal>>('/journals', data),

  updateJournal: (id: number, data: JournalUpdate) =>
    journalApi.put<JournalApiResponse<Journal>>(`/journals/${id}`, data),

  deleteJournal: (id: number) =>
    journalApi.delete<JournalApiResponse<{ deleted: boolean }>>(`/journals/${id}`),

  createEvent: (date: string, data: EventCreate) =>
    journalApi.post<JournalApiResponse<JournalEvent>>(`/journals/${date}/events`, data),

  getEvent: (id: number) =>
    journalApi.get<JournalApiResponse<JournalEvent>>(`/events/${id}`),

  updateEvent: (id: number, data: EventUpdate) =>
    journalApi.put<JournalApiResponse<JournalEvent>>(`/events/${id}`, data),

  deleteEvent: (id: number) =>
    journalApi.delete<JournalApiResponse<{ deleted: boolean }>>(`/events/${id}`),

  createReflection: (eventId: number, data: ReflectionCreate) =>
    journalApi.post<JournalApiResponse<Reflection>>(`/events/${eventId}/reflections`, data),

  getReflection: (id: number) =>
    journalApi.get<JournalApiResponse<Reflection>>(`/reflections/${id}`),

  updateReflection: (id: number, data: ReflectionUpdate) =>
    journalApi.put<JournalApiResponse<Reflection>>(`/reflections/${id}`, data),

  deleteReflection: (id: number) =>
    journalApi.delete<JournalApiResponse<{ deleted: boolean }>>(`/reflections/${id}`),
};

export default journalApi;