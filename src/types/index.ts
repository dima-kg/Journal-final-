export type EntryCategory = 
  | 'equipment_work'
  | 'relay_protection'
  | 'team_permits'
  | 'emergency'
  | 'network_outages'
  | 'other';

export type EntryStatus = 'draft' | 'active' | 'cancelled';

export type ShiftType = 'day' | 'night';
export type HandoverStatus = 'pending' | 'completed' | 'cancelled';

export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface Equipment {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface JournalEntry {
  id: string;
  category: EntryCategory;
  title: string;
  description: string;
  timestamp: Date;
  author: string;
  status: EntryStatus;
  equipment?: Equipment;
  location?: Location;
  categoryData?: Category;
  priority: 'low' | 'medium' | 'high' | 'critical';
  cancelledAt?: Date;
  cancelledBy?: string;
  cancelReason?: string;
}

export interface ShiftHandover {
  id: string;
  shift_date: Date;
  shift_type: ShiftType;
  outgoing_operator_id: string;
  outgoing_operator_name: string;
  incoming_operator_id?: string;
  incoming_operator_name?: string;
  ongoing_works?: string;
  special_instructions?: string;
  incidents?: string;
  handover_notes?: string;
  status: HandoverStatus;
  handed_over_at?: Date;
  received_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface FilterOptions {
  category?: EntryCategory;
  status?: EntryStatus;
  priority?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchText?: string;
  equipmentId?: string;
  locationId?: string;
  categoryId?: string;
}

export interface HandoverFilterOptions {
  status?: HandoverStatus;
  shift_type?: ShiftType;
  dateFrom?: Date;
  dateTo?: Date;
  operator?: string;
}