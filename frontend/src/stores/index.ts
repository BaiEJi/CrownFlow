/**
 * Zustand 状态管理模块
 *
 * 使用 Zustand 管理全局状态，包括分类和会员数据。
 * 注意：当前页面组件使用自定义 hooks，此 store 保留供高级场景使用。
 *
 * @module stores
 */

import { create } from 'zustand';
import type { Category, Member, MemberCreate } from '@/types';
import { categoryApi, memberApi, ApiError } from '@/services/api';

interface AuthState {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>(() => ({
  isAuthenticated: !!localStorage.getItem('auth'),

  login: (username: string, password: string) => {
    const auth = btoa(`${username}:${password}`);
    localStorage.setItem('auth', auth);
    return true;
  },

  logout: () => {
    localStorage.removeItem('auth');
    window.location.href = '/login';
  },

  checkAuth: () => {
    return !!localStorage.getItem('auth');
  },
}));

/**
 * 分类状态接口
 */
interface CategoryState {
  /** 分类列表 */
  categories: Category[];
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 获取分类列表 */
  fetchCategories: () => Promise<void>;
  /** 添加分类 */
  addCategory: (data: { name: string; icon?: string; color?: string }) => Promise<Category>;
  /** 更新分类 */
  updateCategory: (id: number, data: Partial<Category>) => Promise<void>;
  /** 删除分类 */
  deleteCategory: (id: number) => Promise<void>;
}

/**
 * 分类状态管理 Store
 */
export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await categoryApi.getAll();
      set({ categories: response.data.data, loading: false });
    } catch (error) {
      const err = error as ApiError;
      set({ loading: false, error: err.message || '获取分类失败' });
      throw error;
    }
  },

  addCategory: async (data) => {
    const response = await categoryApi.create(data);
    const newCategory = response.data.data;
    set({ categories: [...get().categories, newCategory] });
    return newCategory;
  },

  updateCategory: async (id, data) => {
    const response = await categoryApi.update(id, data);
    const updatedCategory = response.data.data;
    set({
      categories: get().categories.map((c) =>
        c.id === id ? updatedCategory : c
      ),
    });
  },

  deleteCategory: async (id) => {
    await categoryApi.delete(id);
    set({ categories: get().categories.filter((c) => c.id !== id) });
  },
}));

/**
 * 会员状态接口
 */
interface MemberState {
  /** 会员列表 */
  members: Member[];
  /** 总数 */
  total: number;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 获取会员列表 */
  fetchMembers: (params?: {
    page?: number;
    page_size?: number;
    category_id?: number;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
    order?: 'asc' | 'desc';
  }) => Promise<void>;
  /** 添加会员 */
  addMember: (data: MemberCreate) => Promise<Member>;
  /** 更新会员 */
  updateMember: (id: number, data: Partial<Member>) => Promise<void>;
  /** 删除会员 */
  deleteMember: (id: number) => Promise<void>;
}

/**
 * 会员状态管理 Store
 */
export const useMemberStore = create<MemberState>((set, get) => ({
  members: [],
  total: 0,
  loading: false,
  error: null,

  fetchMembers: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await memberApi.getAll(params);
      set({
        members: response.data.data.items,
        total: response.data.data.total,
        loading: false,
      });
    } catch (error) {
      const err = error as ApiError;
      set({ loading: false, error: err.message || '获取会员列表失败' });
      throw error;
    }
  },

  addMember: async (data) => {
    const response = await memberApi.create(data);
    const newMember = response.data.data;
    set({
      members: [newMember, ...get().members],
      total: get().total + 1,
    });
    return newMember;
  },

  updateMember: async (id, data) => {
    const response = await memberApi.update(id, data);
    const updatedMember = response.data.data;
    set({
      members: get().members.map((m) =>
        m.id === id ? updatedMember : m
      ),
    });
  },

  deleteMember: async (id) => {
    await memberApi.delete(id);
    set({
      members: get().members.filter((m) => m.id !== id),
      total: get().total - 1,
    });
  },
}));
