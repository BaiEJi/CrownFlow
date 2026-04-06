/**
 * useCategories Hook
 *
 * 分类数据管理 Hook，提供分类的增删改查功能。
 *
 * @module hooks/useCategories
 */

import { useCallback, useState } from 'react';
import { categoryApi } from '@/services/api';
import type { Category, CategoryCreate, CategoryUpdate } from '@/types';
import { useApi } from './useApi';

/**
 * 分类管理 Hook
 * @param immediate - 是否立即获取数据，默认 true
 */
export function useCategories(immediate = true) {
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    loading,
    error,
    execute: fetchCategories,
  } = useApi(
    async () => {
      const response = await categoryApi.getAll();
      const cats = response.data.data;
      setCategories(cats);
      return cats;
    },
    { immediate }
  );

  const createCategory = useCallback(async (data: CategoryCreate) => {
    const response = await categoryApi.create(data);
    const newCategory = response.data.data;
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  }, []);

  const updateCategory = useCallback(async (id: number, data: CategoryUpdate) => {
    const response = await categoryApi.update(id, data);
    const updatedCategory = response.data.data;
    setCategories(prev => prev.map((cat: Category) =>
      cat.id === id ? updatedCategory : cat
    ));
    return updatedCategory;
  }, []);

  const deleteCategory = useCallback(async (id: number) => {
    await categoryApi.delete(id);
    setCategories(prev => prev.filter((cat: Category) => cat.id !== id));
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
