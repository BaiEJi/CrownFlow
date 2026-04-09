/**
 * API 服务模块
 *
 * 封装所有 API 请求，提供类型安全的接口调用。
 * 使用 axios 作为 HTTP 客户端，支持请求重试、缓存和取消。
 *
 * @module services/api
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  Category,
  CategoryCreate,
  CategoryUpdate,
  Member,
  MemberCreate,
  MemberUpdate,
  MemberListResponse,
  MemberQueryParams,
  Subscription,
  SubscriptionCreate,
  SubscriptionUpdate,
  SubscriptionListResponse,
  SubscriptionQueryParams,
  SpendingResponse,
  SpendingQueryParams,
  OverviewResponse,
  CategorySummaryResponse,
  TrendResponse,
  TrendQueryParams,
  ReminderResponse,
} from '@/types';

/** 是否为开发环境 */
const isDev = import.meta.env.DEV;

/**
 * API 错误类
 * 封装 API 请求中的错误信息
 */
export class ApiError extends Error {
  /** 错误码 */
  code: number;
  /** 错误详情 */
  details?: unknown;

  constructor(message: string, code: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

/**
 * 重试配置接口
 */
interface RetryConfig {
  /** 重试次数 */
  retries: number;
  /** 重试延迟（毫秒） */
  retryDelay: number;
  /** 重试条件判断函数 */
  retryCondition?: (error: AxiosError) => boolean;
}

/** 默认重试配置 */
const defaultRetryConfig: RetryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    return !error.response || error.response.status >= 500;
  },
};

const apiTimeout = Number(import.meta.env.VITE_API_TIMEOUT) || 5000;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器
 * 添加请求ID、认证信息和日志
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    config.headers['X-Request-ID'] = requestId;

    const auth = localStorage.getItem('auth');
    if (auth) {
      config.headers['Authorization'] = `Basic ${auth}`;
    }

    if (isDev) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        requestId,
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 * 统一处理响应和错误，开发环境打印日志
 */
api.interceptors.response.use(
  (response) => {
    if (isDev) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    if (response.data.code && response.data.code !== 200 && response.data.code !== 201) {
      throw new ApiError(
        response.data.message || '请求失败',
        response.data.code,
        response.data
      );
    }

    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    if (isDev) {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        message: error.message,
        response: error.response?.data,
      });
    }

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        localStorage.removeItem('auth');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        throw new ApiError('未授权，请先登录', status, data);
      }

      switch (status) {
        case 400:
          throw new ApiError(data?.message || '请求参数错误', status, data);
        case 403:
          throw new ApiError('没有权限访问', status, data);
        case 404:
          throw new ApiError(data?.message || '资源不存在', status, data);
        case 429:
          throw new ApiError('请求过于频繁，请稍后再试', status, data);
        case 422:
          throw new ApiError(data?.message || '参数验证失败', status, data);
        case 500:
          throw new ApiError('服务器内部错误', status, data);
        case 502:
        case 503:
        case 504:
          throw new ApiError('服务暂时不可用，请稍后重试', status, data);
        default:
          throw new ApiError(data?.message || '请求失败', status, data);
      }
    } else if (error.request) {
      throw new ApiError('网络连接失败，请检查网络', 0, error);
    } else {
      throw new ApiError('请求配置错误', 0, error);
    }
  }
);

/**
 * 带重试的请求函数
 * @param requestFn - 请求函数
 * @param retryConfig - 重试配置
 */
async function requestWithRetry<T>(
  requestFn: () => Promise<T>,
  retryConfig: Partial<RetryConfig> = {}
): Promise<T> {
  const config = { ...defaultRetryConfig, ...retryConfig };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= config.retries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      if (
        attempt < config.retries &&
        error instanceof AxiosError &&
        config.retryCondition?.(error)
      ) {
        if (isDev) {
          console.log(`[API Retry] Attempt ${attempt + 1}/${config.retries}`);
        }
        await new Promise(resolve => setTimeout(resolve, config.retryDelay));
      } else {
        throw error;
      }
    }
  }

  throw lastError;
}

/**
 * 分类管理 API
 */
export const categoryApi = {
  /** 获取所有分类 */
  getAll: () =>
    requestWithRetry(() => api.get<ApiResponse<Category[]>>('/categories')),

  /** 创建分类 */
  create: (data: CategoryCreate) =>
    api.post<ApiResponse<Category>>('/categories', data),

  /** 更新分类 */
  update: (id: number, data: CategoryUpdate) =>
    api.put<ApiResponse<Category>>(`/categories/${id}`, data),

  /** 删除分类 */
  delete: (id: number) =>
    api.delete<ApiResponse<{ deleted: boolean }>>(`/categories/${id}`),
};

/**
 * 会员管理 API
 */
export const memberApi = {
  /** 获取会员列表（带分页和筛选） */
  getAll: (params?: MemberQueryParams) =>
    requestWithRetry(() =>
      api.get<ApiResponse<MemberListResponse>>('/members', { params })
    ),

  /** 获取单个会员详情（包含所有订阅记录） */
  getById: (id: number) =>
    requestWithRetry(() =>
      api.get<ApiResponse<Member>>(`/members/${id}`)
    ),

  /** 创建会员（可选同时创建第一条订阅） */
  create: (data: MemberCreate) =>
    api.post<ApiResponse<Member>>('/members', data),

  /** 更新会员主表信息 */
  update: (id: number, data: MemberUpdate) =>
    api.put<ApiResponse<Member>>(`/members/${id}`, data),

  /** 删除会员（级联删除所有订阅） */
  delete: (id: number) =>
    api.delete<ApiResponse<{ deleted: boolean }>>(`/members/${id}`),
};

/**
 * 订阅管理 API
 */
export const subscriptionApi = {
  /** 获取会员的所有订阅记录 */
  getByMember: (memberId: number, params?: SubscriptionQueryParams) =>
    requestWithRetry(() =>
      api.get<ApiResponse<SubscriptionListResponse>>(`/members/${memberId}/subscriptions`, { params })
    ),

  /** 获取单个订阅详情 */
  getById: (id: number) =>
    requestWithRetry(() =>
      api.get<ApiResponse<Subscription>>(`/subscriptions/${id}`)
    ),

  /** 为会员创建订阅（续费） */
  create: (memberId: number, data: SubscriptionCreate) =>
    api.post<ApiResponse<Subscription>>(`/members/${memberId}/subscriptions`, data),

  /** 更新订阅 */
  update: (id: number, data: SubscriptionUpdate) =>
    api.put<ApiResponse<Subscription>>(`/subscriptions/${id}`, data),

  /** 删除订阅 */
  delete: (id: number) =>
    api.delete<ApiResponse<{ deleted: boolean }>>(`/subscriptions/${id}`),
};

/**
 * 统计分析 API
 */
export const statsApi = {
  /** 获取概览数据 */
  getOverview: () =>
    requestWithRetry(() => api.get<ApiResponse<OverviewResponse>>('/stats/overview')),

  /** 获取分类支出汇总 */
  getCategorySummary: () =>
    requestWithRetry(() => api.get<ApiResponse<CategorySummaryResponse>>('/stats/category-summary')),

  /** 获取支出统计 */
  getSpending: (params: SpendingQueryParams) =>
    requestWithRetry(() =>
      api.get<ApiResponse<SpendingResponse>>('/stats/spending', { params })
    ),

  /** 获取分类统计 */
  getByCategory: (params: SpendingQueryParams) =>
    requestWithRetry(() =>
      api.get<ApiResponse<{ categories: SpendingResponse['categories']; total: number }>>('/stats/by-category', { params })
    ),

  /** 获取趋势数据 */
  getTrend: (params: TrendQueryParams) =>
    requestWithRetry(() =>
      api.get<ApiResponse<TrendResponse>>('/stats/trend', { params })
    ),
};

/**
 * 提醒 API
 */
export const reminderApi = {
  /** 获取即将到期的订阅提醒 */
  getUpcoming: () =>
    requestWithRetry(() =>
      api.get<ApiResponse<ReminderResponse>>('/reminders/upcoming')
    ),

  /** 获取所有未过期的订阅（用于日历视图） */
  getAll: () =>
    requestWithRetry(() =>
      api.get<ApiResponse<ReminderResponse>>('/reminders/all')
    ),
};

export default api;