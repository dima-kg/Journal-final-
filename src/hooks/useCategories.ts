import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Category } from '../types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      const transformedCategories: Category[] = data.map(item => ({
        id: item.id,
        code: item.code,
        name: item.name,
        description: item.description || undefined,
        is_active: item.is_active,
        sort_order: item.sort_order,
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at),
      }));

      setCategories(transformedCategories);
    } catch (error) {
      console.error('Error in fetchCategories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (data: { 
    code: string; 
    name: string; 
    description?: string; 
    sort_order?: number;
  }) => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          code: data.code,
          name: data.name,
          description: data.description || null,
          sort_order: data.sort_order || 0,
        });

      if (error) {
        console.error('Error adding category:', error);
        throw error;
      }

      await fetchCategories();
    } catch (error) {
      console.error('Error in addCategory:', error);
      throw error;
    }
  };

  const updateCategory = async (id: string, data: { 
    code?: string; 
    name?: string; 
    description?: string; 
    is_active?: boolean;
    sort_order?: number;
  }) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', id);

      if (error) {
        console.error('Error updating category:', error);
        throw error;
      }

      await fetchCategories();
    } catch (error) {
      console.error('Error in updateCategory:', error);
      throw error;
    }
  };

  const getActiveCategories = () => {
    return categories.filter(item => item.is_active);
  };

  const getCategoryByCode = (code: string) => {
    return categories.find(item => item.code === code);
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    getActiveCategories,
    getCategoryByCode,
    refetch: fetchCategories,
  };
};
