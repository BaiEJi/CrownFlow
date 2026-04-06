/**
 * 工具函数模块
 *
 * 提供日期格式化、价格格式化等通用工具函数。
 *
 * @module utils
 */

import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

dayjs.extend(quarterOfYear);

/**
 * 格式化日期
 * @param date - 日期字符串
 * @param format - 格式化模板，默认 YYYY-MM-DD
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: string, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

/**
 * 格式化价格
 * @param price - 价格数值
 * @param currency - 币种，默认 CNY
 * @returns 格式化后的价格字符串（如 ¥15.99）
 */
export const formatPrice = (price: number, currency = 'CNY'): string => {
  const symbols: Record<string, string> = {
    CNY: '¥',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${price.toFixed(2)}`;
};

/**
 * 获取计费周期的中文标签
 * @param cycle - 计费周期类型
 * @returns 中文标签
 */
export const getBillingCycleLabel = (cycle: string): string => {
  const labels: Record<string, string> = {
    monthly: '月付',
    quarterly: '季付',
    yearly: '年付',
    custom: '自定义',
  };
  return labels[cycle] || cycle;
};

/**
 * 计算剩余天数
 * @param endDate - 结束日期
 * @returns 剩余天数（可能为负数表示已过期）
 */
export const getDaysRemaining = (endDate: string): number => {
  const end = dayjs(endDate);
  const today = dayjs();
  return end.diff(today, 'day');
};

/**
 * 判断是否即将到期
 * @param endDate - 结束日期
 * @param reminderDays - 提醒天数
 * @returns 是否在提醒范围内
 */
export const isExpiringSoon = (endDate: string, reminderDays: number): boolean => {
  const daysRemaining = getDaysRemaining(endDate);
  return daysRemaining >= 0 && daysRemaining <= reminderDays;
};

/**
 * 获取日期范围
 * @param type - 范围类型
 * @param customStart - 自定义开始日期
 * @param customEnd - 自定义结束日期
 * @returns 日期范围对象
 */
export const getDateRange = (
  type: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom',
  customStart?: string,
  customEnd?: string
): { start: string; end: string } => {
  const today = dayjs();

  switch (type) {
    case 'today':
      return { start: today.format('YYYY-MM-DD'), end: today.format('YYYY-MM-DD') };
    case 'week':
      return {
        start: today.startOf('week').format('YYYY-MM-DD'),
        end: today.endOf('week').format('YYYY-MM-DD'),
      };
    case 'month':
      return {
        start: today.startOf('month').format('YYYY-MM-DD'),
        end: today.endOf('month').format('YYYY-MM-DD'),
      };
    case 'quarter':
      return {
        start: today.startOf('quarter').format('YYYY-MM-DD'),
        end: today.endOf('quarter').format('YYYY-MM-DD'),
      };
    case 'year':
      return {
        start: today.startOf('year').format('YYYY-MM-DD'),
        end: today.endOf('year').format('YYYY-MM-DD'),
      };
    case 'custom':
      return {
        start: customStart || today.format('YYYY-MM-DD'),
        end: customEnd || today.format('YYYY-MM-DD'),
      };
    default:
      return { start: today.format('YYYY-MM-DD'), end: today.format('YYYY-MM-DD') };
  }
};

/**
 * 根据百分比获取颜色
 * @param percentage - 百分比值
 * @returns 颜色代码
 */
export const getPercentageColor = (percentage: number): string => {
  if (percentage >= 50) return '#f5222d';
  if (percentage >= 30) return '#fa8c16';
  if (percentage >= 10) return '#52c41a';
  return '#1890ff';
};

/**
 * 判断是否为闰年
 * @param year - 年份
 * @returns 是否为闰年
 */
const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

/**
 * 计算日均支出
 * @param price - 价格
 * @param billingCycle - 计费周期
 * @param customDays - 自定义天数
 * @param startDate - 开始日期（用于计算月份天数和闰年）
 * @returns 日均支出
 */
export const calculateDailyRate = (
  price: number,
  billingCycle: string,
  customDays?: number,
  startDate?: string
): number => {
  let days = 30;

  switch (billingCycle) {
    case 'monthly':
      if (startDate) {
        const date = dayjs(startDate);
        days = date.daysInMonth();
      } else {
        days = 30;
      }
      break;
    case 'quarterly':
      days = 90;
      break;
    case 'yearly':
      if (startDate) {
        const year = dayjs(startDate).year();
        days = isLeapYear(year) ? 366 : 365;
      } else {
        days = 365;
      }
      break;
    case 'custom':
      days = customDays || 30;
      break;
  }

  return price / days;
};

/**
 * 防抖函数
 * @param fn - 要执行的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * 节流函数
 * @param fn - 要执行的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      fn.apply(this, args);
      lastCall = now;
    }
  };
}

/**
 * 深拷贝对象
 * @param obj - 要拷贝的对象
 * @returns 拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 判断是否为空值
 * @param value - 要检查的值
 * @returns 是否为空
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * 颜色调整相关工具函数
 */
export { adjustColorForDarkMode, isDarkColor, getLuminance, type AdjustmentOptions } from './color';
