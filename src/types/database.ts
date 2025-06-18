export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          category: 'equipment_work' | 'relay_protection' | 'team_permits' | 'emergency' | 'network_outages' | 'other';
          title: string;
          description: string;
          author_id: string;
          author_name: string;
          status: 'draft' | 'active' | 'cancelled';
          equipment: string | null; // Старое поле, будет удалено
          location: string | null; // Старое поле, будет удалено
          equipment_id: string | null;
          location_id: string | null;
          category_id: string | null;
          priority: 'low' | 'medium' | 'high' | 'critical';
          cancelled_at: string | null;
          cancelled_by: string | null;
          cancel_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category?: 'equipment_work' | 'relay_protection' | 'team_permits' | 'emergency' | 'network_outages' | 'other';
          title: string;
          description: string;
          author_id: string;
          author_name: string;
          status?: 'draft' | 'active' | 'cancelled';
          equipment?: string | null;
          location?: string | null;
          equipment_id?: string | null;
          location_id?: string | null;
          category_id?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'critical';
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          cancel_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: 'equipment_work' | 'relay_protection' | 'team_permits' | 'emergency' | 'network_outages' | 'other';
          title?: string;
          description?: string;
          author_id?: string;
          author_name?: string;
          status?: 'draft' | 'active' | 'cancelled';
          equipment?: string | null;
          location?: string | null;
          equipment_id?: string | null;
          location_id?: string | null;
          category_id?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'critical';
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          cancel_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      equipment: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}