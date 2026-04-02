import React from 'react';
import type { IdeaColor } from '../../types/ideas';

const COLORS: { value: IdeaColor; bg: string; ring: string }[] = [
  { value: 'default', bg: 'bg-white border border-gray-200', ring: 'ring-gray-400' },
  { value: 'red',     bg: 'bg-red-100',     ring: 'ring-red-400' },
  { value: 'orange',  bg: 'bg-orange-100',  ring: 'ring-orange-400' },
  { value: 'yellow',  bg: 'bg-yellow-100',  ring: 'ring-yellow-400' },
  { value: 'green',   bg: 'bg-emerald-100', ring: 'ring-emerald-400' },
  { value: 'teal',    bg: 'bg-teal-100',    ring: 'ring-teal-400' },
  { value: 'blue',    bg: 'bg-blue-100',    ring: 'ring-blue-400' },
  { value: 'purple',  bg: 'bg-purple-100',  ring: 'ring-purple-400' },
  { value: 'pink',    bg: 'bg-pink-100',    ring: 'ring-pink-400' },
];

interface IdeaColorPickerProps {
  value: IdeaColor;
  onChange: (color: IdeaColor) => void;
  size?: 'sm' | 'md';
}

export const IdeaColorPicker: React.FC<IdeaColorPickerProps> = ({ value, onChange, size = 'md' }) => {
  const dotSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onChange(c.value)}
          className={`${dotSize} rounded-full ${c.bg} transition-all duration-150 flex items-center justify-center shrink-0 ${
            value === c.value ? `ring-2 ${c.ring} ring-offset-1` : 'hover:scale-110'
          }`}
          title={c.value === 'default' ? 'No color' : c.value}
        >
          {value === c.value && (
            <svg className={`${size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-gray-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
};

// Map IdeaColor to Tailwind card background classes
export const IDEA_COLOR_MAP: Record<IdeaColor, string> = {
  default: 'bg-white',
  red:     'bg-red-50',
  orange:  'bg-orange-50',
  yellow:  'bg-yellow-50',
  green:   'bg-emerald-50',
  teal:    'bg-teal-50',
  blue:    'bg-blue-50',
  purple:  'bg-purple-50',
  pink:    'bg-pink-50',
};

export const IDEA_BORDER_MAP: Record<IdeaColor, string> = {
  default: 'border-gray-100',
  red:     'border-red-100',
  orange:  'border-orange-100',
  yellow:  'border-yellow-100',
  green:   'border-emerald-100',
  teal:    'border-teal-100',
  blue:    'border-blue-100',
  purple:  'border-purple-100',
  pink:    'border-pink-100',
};
