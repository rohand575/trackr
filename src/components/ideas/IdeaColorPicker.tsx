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
  default: 'bg-white dark:bg-gray-900',
  red:     'bg-red-50 dark:bg-red-950/40',
  orange:  'bg-orange-50 dark:bg-orange-950/40',
  yellow:  'bg-yellow-50 dark:bg-yellow-950/30',
  green:   'bg-emerald-50 dark:bg-emerald-950/40',
  teal:    'bg-teal-50 dark:bg-teal-950/40',
  blue:    'bg-blue-50 dark:bg-blue-950/40',
  purple:  'bg-purple-50 dark:bg-purple-950/40',
  pink:    'bg-pink-50 dark:bg-pink-950/40',
};

export const IDEA_BORDER_MAP: Record<IdeaColor, string> = {
  default: 'border-gray-100 dark:border-gray-800',
  red:     'border-red-100 dark:border-red-900/50',
  orange:  'border-orange-100 dark:border-orange-900/50',
  yellow:  'border-yellow-100 dark:border-yellow-900/50',
  green:   'border-emerald-100 dark:border-emerald-900/50',
  teal:    'border-teal-100 dark:border-teal-900/50',
  blue:    'border-blue-100 dark:border-blue-900/50',
  purple:  'border-purple-100 dark:border-purple-900/50',
  pink:    'border-pink-100 dark:border-pink-900/50',
};
