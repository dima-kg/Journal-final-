import React from 'react';

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = "" }) => {
  const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
  
  const priorityClasses = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800"
  };

  const priorityLabels = {
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
    critical: "Критический"
  };

  return (
    <span className={`${baseClasses} ${priorityClasses[priority]} ${className}`}>
      {priorityLabels[priority]}
    </span>
  );
};

export default PriorityBadge;