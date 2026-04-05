import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullscreen?: boolean;
}

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', fullscreen }) => {
  const spinner = (
    <div
      className={`${sizes[size]} rounded-full border-indigo-200 border-t-indigo-600 animate-spin`}
    />
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-3 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
};
