import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Location } from '../types';

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching locations:', error);
        return;
      }

      const transformedLocations: Location[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || undefined,
        is_active: item.is_active,
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at),
      }));

      setLocations(transformedLocations);
    } catch (error) {
      console.error('Error in fetchLocations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const addLocation = async (data: { name: string; description?: string }) => {
    try {
      const { error } = await supabase
        .from('locations')
        .insert({
          name: data.name,
          description: data.description || null,
        });

      if (error) {
        console.error('Error adding location:', error);
        throw error;
      }

      await fetchLocations();
    } catch (error) {
      console.error('Error in addLocation:', error);
      throw error;
    }
  };

  const updateLocation = async (id: string, data: { name?: string; description?: string; is_active?: boolean }) => {
    try {
      const { error } = await supabase
        .from('locations')
        .update(data)
        .eq('id', id);

      if (error) {
        console.error('Error updating location:', error);
        throw error;
      }

      await fetchLocations();
    } catch (error) {
      console.error('Error in updateLocation:', error);
      throw error;
    }
  };

  const getActiveLocations = () => {
    return locations.filter(item => item.is_active);
  };

  return {
    locations,
    loading,
    addLocation,
    updateLocation,
    getActiveLocations,
    refetch: fetchLocations,
  };
};