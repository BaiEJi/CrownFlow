/**
 * TypeScript 类型定义
 * 
 * 定义了前端使用的所有数据类型，与后端 API 保持一致。
 * 
 * 核心模型关系：
 * - Category: 分类
 * - Member: 会员主表（支持多次续费）
 * - Subscription: 订阅记录（每次续费产生一条记录）
 */

/** API 统一响应格式 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 分类数据 */
export interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  created_at: string;
}

/** 创建分类请求 */
export interface CategoryCreate {
  name: string;
  icon?: string;
  color?: string;
}

/** 更新分类请求 */
export interface CategoryUpdate {
  name?: string;
  icon?: string;
  color?: string;
}

/** 订阅记录数据 */
export interface Subscription {
  id: number;
  member_id: number;
  level?: string;
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  custom_days?: number;
  start_date: string;
  end_date: string;
  channel?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/** 创建订阅请求 */
export interface SubscriptionCreate {
  level?: string;
  price: number;
  currency?: string;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  custom_days?: number;
  start_date: string;
  end_date: string;
  channel?: string;
  notes?: string;
}

/** 更新订阅请求 */
export interface SubscriptionUpdate {
  level?: string;
  price?: number;
  currency?: string;
  billing_cycle?: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  custom_days?: number;
  start_date?: string;
  end_date?: string;
  channel?: string;
  notes?: string;
}

/** 订阅列表响应 */
export interface SubscriptionListResponse {
  items: Subscription[];
  total: number;
}

/** 会员数据（主表） */
export interface Member {
  id: number;
  name: string;
  category_id?: number;
  category?: Category;
  notes?: string;
  reminder_days: number;
  /** 最新订阅信息（优先显示有效订阅） */
  latest_subscription?: Subscription;
  /** 会员状态：active=有任意订阅有效，expired=所有订阅过期 */
  status: 'active' | 'expired';
  /** 订阅记录数 */
  subscription_count: number;
  /** 累计花费 */
  total_spending: number;
  /** 累计订阅时长（天数） */
  total_duration_days?: number;
  created_at: string;
  updated_at: string;
  /** 所有订阅记录（仅在详情页返回） */
  subscriptions?: Subscription[];
}

/** 创建会员请求 */
export interface MemberCreate {
  name: string;
  category_id?: number;
  notes?: string;
  reminder_days?: number;
  /** 可选：创建会员时同时创建第一条订阅 */
  subscription?: SubscriptionCreate;
}

/** 更新会员请求 */
export interface MemberUpdate {
  name?: string;
  category_id?: number;
  notes?: string;
  reminder_days?: number;
}

/** 会员列表响应 */
export interface MemberListResponse {
  items: Member[];
  total: number;
}

/** 分类统计数据 */
export interface CategoryStats {
  category_id: number;
  category_name: string;
  category_icon?: string;
  category_color?: string;
  total: number;
  count: number;
  percentage: number;
  details?: SpendingDetail[];
}

/** 支出明细 */
export interface SpendingDetail {
  subscription_id?: number;
  member_name: string;
  level?: string;
  amount: number;
}

/** 趋势图分类明细 */
export interface TrendCategoryDetail {
  category_id: number;
  category_name: string;
  category_color: string;
  total: number;
  subscriptions: SpendingDetail[];
}

/** 支出统计响应 */
export interface SpendingResponse {
  total: number;
  daily_average: number;
  by_currency: Record<string, number>;
  categories: CategoryStats[];
}

/** 概览数据响应 */
export interface OverviewResponse {
  total_members: number;
  active_members: number;
  monthly_spending: number;
  yearly_spending: number;
}

/** 分类支出汇总项 */
export interface CategorySummaryItem {
  category_id: number;
  category_name: string;
  category_icon?: string;
  category_color?: string;
  monthly_spending: number;
  yearly_spending: number;
}

/** 分类支出汇总响应 */
export interface CategorySummaryResponse {
  categories: CategorySummaryItem[];
  total_monthly: number;
  total_yearly: number;
}

/** 趋势数据项 */
export interface TrendItem {
  date: string;
  amount: number;
  details?: TrendCategoryDetail[];
}

/** 趋势数据响应 */
export interface TrendResponse {
  trend: TrendItem[];
}

/** 提醒项数据 */
export interface ReminderItem {
  subscription_id: number;
  member_id: number;
  member_name: string;
  level?: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  end_date: string;
  days_remaining: number;
  price: number;
  currency: string;
}

/** 提醒列表响应 */
export interface ReminderResponse {
  reminders: ReminderItem[];
}

/** 会员查询参数 */
export interface MemberQueryParams {
  page?: number;
  page_size?: number;
  category_id?: number;
  sort_by?: string;
  order?: 'asc' | 'desc';
  status?: 'active' | 'expired';
  keyword?: string;
}

/** 订阅查询参数 */
export interface SubscriptionQueryParams {
  status?: 'active' | 'expired';
  start_date?: string;
  end_date?: string;
  sort_by?: 'created_at' | 'start_date' | 'end_date' | 'price';
  order?: 'asc' | 'desc';
}

/** 支出统计查询参数 */
export interface SpendingQueryParams {
  start_date: string;
  end_date: string;
}

/** 趋势数据查询参数 */
export interface TrendQueryParams {
  start_date: string;
  end_date: string;
  granularity?: 'day' | 'month' | 'week' | 'quarter';
}