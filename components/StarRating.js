import React from 'react';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarFilled } from '@heroicons/react/24/solid';

/**
 * Star rating component that can be used in both display and interactive mode
 * @param {Object} props - Component props
 * @param {number} props.rating - Current rating (1-5)
 * @param {boolean} props.interactive - If true, user can change the rating
 * @param {function} props.onChange - Callback when rating changes (only used when interactive=true)
 * @param {string} props.size - Size of stars ('sm', 'md', 'lg') 
 * @param {string} props.className - Additional CSS classes
 */
const StarRating = ({ 
  rating = 0, 
  interactive = false, 
  onChange = () => {}, 
  size = 'md',
  className = ''
}) => {
  const totalStars = 5;
  
  // Determine star size
  const starSizeClass = {
    'sm': 'h-4 w-4',
    'md': 'h-5 w-5',
    'lg': 'h-6 w-6'
  }[size] || 'h-5 w-5';
  
  // Handle clicking or hovering on a star
  const handleStarClick = (newRating) => {
    if (interactive) {
      onChange(newRating);
    }
  };
  
  // Create array with 5 positions
  const stars = Array.from({ length: totalStars }, (_, index) => {
    const starValue = index + 1;
    const isFilled = starValue <= rating;
    
    return (
      <div 
        key={`star-${index}`}
        onClick={() => handleStarClick(starValue)}
        className={`${interactive ? 'cursor-pointer' : ''} text-yellow-400`}
        title={`${starValue} star${starValue !== 1 ? 's' : ''}`}
      >
        {isFilled ? (
          <StarFilled className={starSizeClass} />
        ) : (
          <StarOutline className={starSizeClass} />
        )}
      </div>
    );
  });
  
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {stars}
      {rating > 0 && (
        <span className="ml-1 text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;