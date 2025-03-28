import React from 'react';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';

/**
 * Component to display prompt usage count and handle incrementing
 * @param {Object} props - Component props
 * @param {number} props.count - Current usage count
 * @param {boolean} props.incrementOnClick - If true, clicking will increment count
 * @param {function} props.onIncrement - Callback when count is incremented
 * @param {string} props.size - Size of the component ('sm', 'md', 'lg')
 * @param {string} props.className - Additional CSS classes
 */
const UsageCounter = ({
  count = 0,
  incrementOnClick = false,
  onIncrement = () => {},
  size = 'md',
  className = '',
}) => {
  // Determine icon size
  const iconSizeClass = {
    'sm': 'h-4 w-4',
    'md': 'h-5 w-5',
    'lg': 'h-6 w-6'
  }[size] || 'h-5 w-5';
  
  // Determine text size
  const textSizeClass = {
    'sm': 'text-xs',
    'md': 'text-sm',
    'lg': 'text-base'
  }[size] || 'text-sm';
  
  const handleClick = () => {
    if (incrementOnClick) {
      onIncrement(count + 1);
    }
  };
  
  return (
    <div 
      className={`flex items-center ${incrementOnClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={incrementOnClick ? handleClick : undefined}
      title={incrementOnClick ? "Click to copy and increment usage count" : `Used ${count} times`}
    >
      <DocumentDuplicateIcon className={`text-gray-500 ${iconSizeClass}`} />
      <span className={`ml-1 ${textSizeClass} text-gray-600`}>
        {count} {count === 1 ? 'use' : 'uses'}
      </span>
    </div>
  );
};

export default UsageCounter;