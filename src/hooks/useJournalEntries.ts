import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { JournalEntry, FilterOptions } from '../types';
import { useAuth } from './useAuth';

export const useJournalEntries = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [loading, setLoading] = useState(true);
  const { user, getUserDisplayName } = useAuth();

  // Загрузка записей из Supabase с JOIN для equipment, locations и categories
  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .select(`
          *,
          equipment:equipment_id(id, name, description, is_active),
          location:location_id(id, name, description, is_active),
          categoryData:category_id(id, code, name, description, is_active, sort_order)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching entries:', error);
        return;
      }

      const transformedEntries: JournalEntry[] = data.map(entry => ({
        id: entry.id,
        category: entry.category || (entry.categoryData?.code as any) || 'other',
        title: entry.title,
        description: entry.description,
        timestamp: new Date(entry.created_at),
        author: entry.author_name,
        status: entry.status,
        equipment: entry.equipment ? {
          id: entry.equipment.id,
          name: entry.equipment.name,
          description: entry.equipment.description || undefined,
          is_active: entry.equipment.is_active,
          created_at: new Date(),
          updated_at: new Date(),
        } : undefined,
        location: entry.location ? {
          id: entry.location.id,
          name: entry.location.name,
          description: entry.location.description || undefined,
          is_active: entry.location.is_active,
          created_at: new Date(),
          updated_at: new Date(),
        } : undefined,
        categoryData: entry.categoryData ? {
          id: entry.categoryData.id,
          code: entry.categoryData.code,
          name: entry.categoryData.name,
          description: entry.categoryData.description || undefined,
          is_active: entry.categoryData.is_active,
          sort_order: entry.categoryData.sort_order,
          created_at: new Date(),
          updated_at: new Date(),
        } : undefined,
        priority: entry.priority,
        cancelledAt: entry.cancelled_at ? new Date(entry.cancelled_at) : undefined,
        cancelledBy: entry.cancelled_by || undefined,
        cancelReason: entry.cancel_reason || undefined,
      }));

      setEntries(transformedEntries);
    } catch (error) {
      console.error('Error in fetchEntries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  // Применение фильтров
  useEffect(() => {
    let filtered = entries;

    if (filters.categoryId) {
      filtered = filtered.filter(entry => entry.categoryData?.id === filters.categoryId);
    }

    if (filters.status) {
      filtered = filtered.filter(entry => entry.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(entry => entry.priority === filters.priority);
    }

    if (filters.equipmentId) {
      filtered = filtered.filter(entry => entry.equipment?.id === filters.equipmentId);
    }

    if (filters.locationId) {
      filtered = filtered.filter(entry => entry.location?.id === filters.locationId);
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(searchLower) ||
        entry.description.toLowerCase().includes(searchLower) ||
        entry.author.toLowerCase().includes(searchLower) ||
        entry.equipment?.name.toLowerCase().includes(searchLower) ||
        entry.location?.name.toLowerCase().includes(searchLower) ||
        entry.categoryData?.name.toLowerCase().includes(searchLower)
      );
    }

    if (filters.dateFrom) {
      // Устанавливаем время начала дня для dateFrom
      const dateFromStart = new Date(filters.dateFrom);
      dateFromStart.setHours(0, 0, 0, 0);
      filtered = filtered.filter(entry => entry.timestamp >= dateFromStart);
    }

    if (filters.dateTo) {
      // Устанавливаем время конца дня для dateTo
      const dateToEnd = new Date(filters.dateTo);
      dateToEnd.setHours(23, 59, 59, 999);
      filtered = filtered.filter(entry => entry.timestamp <= dateToEnd);
    }

    setFilteredEntries(filtered);
  }, [entries, filters]);

  const addEntry = async (entry: {
    categoryId: string;
    title: string;
    description: string;
    author: string;
    status: 'draft' | 'active';
    equipmentId?: string;
    locationId?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          category_id: entry.categoryId,
          title: entry.title,
          description: entry.description,
          author_id: user.id,
          author_name: getUserDisplayName(),
          status: entry.status,
          equipment_id: entry.equipmentId || null,
          location_id: entry.locationId || null,
          priority: entry.priority,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding entry:', error);
        throw error;
      }

      // Обновляем локальный список
      await fetchEntries();
      return data.id;
    } catch (error) {
      console.error('Error in addEntry:', error);
      throw error;
    }
  };

  const cancelEntry = async (id: string, cancelReason: string, cancelledBy: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_by: cancelledBy,
          cancel_reason: cancelReason,
        })
        .eq('id', id)
        .eq('author_id', user.id); // Дополнительная проверка безопасности

      if (error) {
        console.error('Error cancelling entry:', error);
        throw error;
      }

      // Обновляем локальный список
      await fetchEntries();
    } catch (error) {
      console.error('Error in cancelEntry:', error);
      throw error;
    }
  };

  const getEntryById = (id: string) => {
    return entries.find(entry => entry.id === id);
  };

  return {
    entries: filteredEntries,
    loading,
    filters,
    setFilters,
    addEntry,
    cancelEntry,
    getEntryById,
    refetch: fetchEntries,
  };
};