import React from 'react';
import { EntryStatus } from '../types';

interface StatusBadgeProps {
  status: EntryStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
  
  const statusClasses = {
    draft: "bg-amber-100 text-amber-800 border border-amber-200",
    active: "bg-green-100 text-green-800 border border-green-200",
    cancelled: "bg-red-100 text-red-800 border border-red-200"
  };

  const statusLabels = {
    draft: "Черновик",
    active: "Активная",
    cancelled: "Отменена"
  };

  return (
    <span className={`${baseClasses} ${statusClasses[status]} ${className}`}>
      {statusLabels[status]}
    </span>
  );
};

export default StatusBadge;
