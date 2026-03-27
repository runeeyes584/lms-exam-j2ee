'use client';

import { Star } from 'lucide-react';
import React from 'react';

interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  readOnly?: boolean;
  onChange?: (value: number) => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  max = 5,
  size = 18,
  readOnly = false,
  onChange,
}) => {
  const normalized = clamp(Number.isFinite(value) ? value : 0, 0, max);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;
        const active = starValue <= normalized;
        const classes = active
          ? 'text-yellow-500'
          : 'text-gray-300';

        return (
          <button
            key={starValue}
            type="button"
            className={`inline-flex items-center justify-center ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
            onClick={() => {
              if (readOnly || !onChange) return;
              onChange(starValue);
            }}
            aria-label={`rate-${starValue}`}
            disabled={readOnly}
          >
            <Star className={`${classes}`} size={size} fill={active ? 'currentColor' : 'none'} />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
