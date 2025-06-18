import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Equipment } from '../types';

export const useEquipment = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching equipment:', error);
        return;
      }

      const transformedEquipment: Equipment[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || undefined,
        is_active: item.is_active,
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at),
      }));

      setEquipment(transformedEquipment);
    } catch (error) {
      console.error('Error in fetchEquipment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const addEquipment = async (data: { name: string; description?: string }) => {
    try {
      const { error } = await supabase
        .from('equipment')
        .insert({
          name: data.name,
          description: data.description || null,
        });

      if (error) {
        console.error('Error adding equipment:', error);
        throw error;
      }

      await fetchEquipment();
    } catch (error) {
      console.error('Error in addEquipment:', error);
      throw error;
    }
  };

  const updateEquipment = async (id: string, data: { name?: string; description?: string; is_active?: boolean }) => {
    try {
      const { error } = await supabase
        .from('equipment')
        .update(data)
        .eq('id', id);

      if (error) {
        console.error('Error updating equipment:', error);
        throw error;
      }

      await fetchEquipment();
    } catch (error) {
      console.error('Error in updateEquipment:', error);
      throw error;
    }
  };

  const getActiveEquipment = () => {
    return equipment.filter(item => item.is_active);
  };

  return {
    equipment,
    loading,
    addEquipment,
    updateEquipment,
    getActiveEquipment,
    refetch: fetchEquipment,
  };
};