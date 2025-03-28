import React from 'react';

/**
 * A card for displaying a single statistic with icon
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Statistic title
 * @param {string|number} props.value - Statistic value
 * @param {React.ComponentType} props.icon - Icon component
 * @param {string} props.color - Color theme (primary, success, warning, info)
 */
export default function StatCard({ title, value, icon: Icon, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  
  const colorClass = colorClasses[color] || colorClasses.primary;
  
  return (
    <div className={`rounded-lg border ${colorClass} p-5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {Icon && (
          <div className="rounded-full p-3 bg-white bg-opacity-60">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}