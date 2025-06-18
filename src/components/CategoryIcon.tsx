import React from 'react';
import { 
  Wrench, 
  Shield, 
  Users, 
  AlertTriangle, 
  Zap, 
  FileText 
} from 'lucide-react';
import { EntryCategory } from '../types';

interface CategoryIconProps {
  category: EntryCategory;
  className?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = "w-5 h-5" }) => {
  const iconProps = { className };

  switch (category) {
    case 'equipment_work':
      return <Wrench {...iconProps} />;
    case 'relay_protection':
      return <Shield {...iconProps} />;
    case 'team_permits':
      return <Users {...iconProps} />;
    case 'emergency':
      return <AlertTriangle {...iconProps} />;
    case 'network_outages':
      return <Zap {...iconProps} />;
    case 'other':
    default:
      return <FileText {...iconProps} />;
  }
};

export default CategoryIcon;