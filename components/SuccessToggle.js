import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

/**
 * Toggle component to indicate success or failure status of a prompt
 * @param {Object} props - Component props 
 * @param {boolean} props.isSuccess - Current success status
 * @param {boolean} props.interactive - If true, user can toggle the status
 * @param {function} props.onChange - Callback when status changes
 * @param {string} props.size - Size of the toggle ('sm', 'md', 'lg')
 * @param {string} props.className - Additional CSS classes
 */
const SuccessToggle = ({
  isSuccess = null,
  interactive = false,
  onChange = () => {},
  size = 'md',
  className = '',
}) => {
  // Determine icon size
  const iconSizeClass = {
    'sm': 'h-5 w-5',
    'md': 'h-6 w-6',
    'lg': 'h-7 w-7'
  }[size] || 'h-6 w-6';
  
  // Toggle status when clicked
  const handleToggle = () => {
    if (interactive) {
      onChange(!isSuccess);
    }
  };
  
  // If null (not set), show a neutral state
  if (isSuccess === null) {
    return (
      <div 
        className={`inline-flex items-center ${interactive ? 'cursor-pointer' : ''} ${className}`}
        onClick={handleToggle}
        title="Set success status"
      >
        <span className="text-gray-400 text-sm mr-2">Not rated</span>
        <div className="relative inline-flex h-6 w-12 flex-shrink-0 rounded-full border-2 border-gray-300 transition-colors duration-200 ease-in-out">
          <div className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-gray-300 shadow ring-0 transition duration-200 ease-in-out"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`inline-flex items-center ${interactive ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleToggle}
      title={isSuccess ? "Successful prompt" : "Unsuccessful prompt"}
    >
      {isSuccess ? (
        <>
          <CheckCircleIcon className={`text-green-500 ${iconSizeClass}`} />
          <span className="ml-1 text-sm text-green-700">Successful</span>
        </>
      ) : (
        <>
          <XCircleIcon className={`text-red-500 ${iconSizeClass}`} />
          <span className="ml-1 text-sm text-red-700">Needs improvement</span>
        </>
      )}
    </div>
  );
};

export default SuccessToggle;