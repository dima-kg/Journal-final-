import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShiftHandover, HandoverFilterOptions } from '../types';
import { useAuth } from './useAuth';

export const useShiftHandovers = () => {
  const [handovers, setHandovers] = useState<ShiftHandover[]>([]);
  const [filteredHandovers, setFilteredHandovers] = useState<ShiftHandover[]>([]);
  const [filters, setFilters] = useState<HandoverFilterOptions>({});
  const [loading, setLoading] = useState(true);
  const { user, getUserDisplayName } = useAuth();

  const fetchHandovers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shift_handovers')
        .select('*')
        .order('shift_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching handovers:', error);
        return;
      }

      const transformedHandovers: ShiftHandover[] = data.map(item => ({
        id: item.id,
        shift_date: new Date(item.shift_date),
        shift_type: item.shift_type,
        outgoing_operator_id: item.outgoing_operator_id,
        outgoing_operator_name: item.outgoing_operator_name,
        incoming_operator_id: item.incoming_operator_id || undefined,
        incoming_operator_name: item.incoming_operator_name || undefined,
        ongoing_works: item.ongoing_works || undefined,
        special_instructions: item.special_instructions || undefined,
        incidents: item.incidents || undefined,
        handover_notes: item.handover_notes || undefined,
        status: item.status,
        handed_over_at: item.handed_over_at ? new Date(item.handed_over_at) : undefined,
        received_at: item.received_at ? new Date(item.received_at) : undefined,
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at),
      }));

      setHandovers(transformedHandovers);
    } catch (error) {
      console.error('Error in fetchHandovers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHandovers();
    }
  }, [user]);

  // Применение фильтров
  useEffect(() => {
    let filtered = handovers;

    if (filters.status) {
      filtered = filtered.filter(handover => handover.status === filters.status);
    }

    if (filters.shift_type) {
      filtered = filtered.filter(handover => handover.shift_type === filters.shift_type);
    }

    if (filters.operator) {
      const operatorLower = filters.operator.toLowerCase();
      filtered = filtered.filter(handover => 
        handover.outgoing_operator_name.toLowerCase().includes(operatorLower) ||
        (handover.incoming_operator_name && handover.incoming_operator_name.toLowerCase().includes(operatorLower))
      );
    }

    if (filters.dateFrom) {
      const dateFromStart = new Date(filters.dateFrom);
      dateFromStart.setHours(0, 0, 0, 0);
      filtered = filtered.filter(handover => handover.shift_date >= dateFromStart);
    }

    if (filters.dateTo) {
      const dateToEnd = new Date(filters.dateTo);
      dateToEnd.setHours(23, 59, 59, 999);
      filtered = filtered.filter(handover => handover.shift_date <= dateToEnd);
    }

    setFilteredHandovers(filtered);
  }, [handovers, filters]);

  const createHandover = async (data: {
    shift_date: Date;
    shift_type: 'day' | 'night';
    ongoing_works?: string;
    special_instructions?: string;
    incidents?: string;
  }) => {
    if (!user) return null;

    try {
      const { data: result, error } = await supabase
        .from('shift_handovers')
        .insert({
          shift_date: data.shift_date.toISOString().split('T')[0],
          shift_type: data.shift_type,
          outgoing_operator_id: user.id,
          outgoing_operator_name: getUserDisplayName(),
          ongoing_works: data.ongoing_works || null,
          special_instructions: data.special_instructions || null,
          incidents: data.incidents || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating handover:', error);
        throw error;
      }

      await fetchHandovers();
      return result.id;
    } catch (error) {
      console.error('Error in createHandover:', error);
      throw error;
    }
  };

  const acceptHandover = async (id: string, handover_notes?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('shift_handovers')
        .update({
          incoming_operator_id: user.id,
          incoming_operator_name: getUserDisplayName(),
          handover_notes: handover_notes || null,
          status: 'completed',
          received_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('status', 'pending'); // Дополнительная проверка статуса

      if (error) {
        console.error('Error accepting handover:', error);
        throw error;
      }

      await fetchHandovers();
    } catch (error) {
      console.error('Error in acceptHandover:', error);
      throw error;
    }
  };

  const completeHandover = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('shift_handovers')
        .update({
          status: 'completed',
          handed_over_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('outgoing_operator_id', user.id);

      if (error) {
        console.error('Error completing handover:', error);
        throw error;
      }

      await fetchHandovers();
    } catch (error) {
      console.error('Error in completeHandover:', error);
      throw error;
    }
  };

  const cancelHandover = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('shift_handovers')
        .update({
          status: 'cancelled',
        })
        .eq('id', id)
        .eq('outgoing_operator_id', user.id);

      if (error) {
        console.error('Error cancelling handover:', error);
        throw error;
      }

      await fetchHandovers();
    } catch (error) {
      console.error('Error in cancelHandover:', error);
      throw error;
    }
  };

  return {
    handovers: filteredHandovers,
    loading,
    filters,
    setFilters,
    createHandover,
    acceptHandover,
    completeHandover,
    cancelHandover,
    refetch: fetchHandovers,
  };
};
