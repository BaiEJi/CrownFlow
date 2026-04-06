/**
 * 日记相关类型定义
 *
 * 与后端 API 保持一致的数据结构。
 */

/** API 统一响应格式 */
export interface JournalApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 反思数据 */
export interface Reflection {
  id: number;
  event_id: number;
  type: 'good' | 'bad' | 'improve' | 'custom';
  custom_type_name?: string;
  content: string;
  created_at: string;
}

/** 创建反思请求 */
export interface ReflectionCreate {
  type: 'good' | 'bad' | 'improve' | 'custom';
  custom_type_name?: string;
  content: string;
}

/** 更新反思请求 */
export interface ReflectionUpdate {
  type?: 'good' | 'bad' | 'improve' | 'custom';
  custom_type_name?: string;
  content?: string;
}

/** 事件数据 */
export interface JournalEvent {
  id: number;
  journal_id: number;
  title: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  background?: string;
  process?: string;
  result?: string;
  reflection_count: number;
  reflections?: Reflection[];
  created_at: string;
  updated_at: string;
}

/** 创建事件请求 */
export interface EventCreate {
  title: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  background?: string;
  process?: string;
  result?: string;
}

/** 更新事件请求 */
export interface EventUpdate {
  title?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  background?: string;
  process?: string;
  result?: string;
}

/** 日记数据 */
export interface Journal {
  id: number;
  date: string;
  mood?: string;
  weather?: string;
  summary?: string;
  event_count: number;
  events?: JournalEvent[];
  created_at: string;
  updated_at: string;
}

/** 创建日记请求 */
export interface JournalCreate {
  date: string;
  mood?: string;
  weather?: string;
  summary?: string;
}

/** 更新日记请求 */
export interface JournalUpdate {
  mood?: string;
  weather?: string;
  summary?: string;
}

/** 日记列表响应 */
export interface JournalListResponse {
  items: Journal[];
  total: number;
}

/** 日记查询参数 */
export interface JournalQueryParams {
  page?: number;
  page_size?: number;
  start_date?: string;
  end_date?: string;
}

/** 心情选项 */
export const MOOD_OPTIONS = [
  { value: '开心', label: '开心' },
  { value: '平静', label: '平静' },
  { value: '郁闷', label: '郁闷' },
  { value: '兴奋', label: '兴奋' },
  { value: '疲惫', label: '疲惫' },
  { value: '焦虑', label: '焦虑' },
  { value: '满足', label: '满足' },
  { value: '无聊', label: '无聊' },
];

/** 反思类型选项 */
export const REFLECTION_TYPE_OPTIONS = [
  { value: 'good', label: '做得好的', color: 'green' },
  { value: 'bad', label: '做得不好的', color: 'red' },
  { value: 'improve', label: '改进建议', color: 'blue' },
  { value: 'custom', label: '自定义', color: 'purple' },
];

/** 反思类型标签 */
export const REFLECTION_TYPE_LABELS: Record<string, string> = {
  good: '做得好的',
  bad: '做得不好的',
  improve: '改进建议',
  custom: '自定义',
};

/** 反思类型颜色 */
export const REFLECTION_TYPE_COLORS: Record<string, string> = {
  good: 'green',
  bad: 'red',
  improve: 'blue',
  custom: 'purple',
};