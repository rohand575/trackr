import React from 'react';

interface WidgetSkeletonProps {
  lines?: number;
  hasHeader?: boolean;
  className?: string;
}

export const WidgetSkeleton: React.FC<WidgetSkeletonProps> = ({
  lines = 3,
  hasHeader = true,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 animate-pulse ${className}`}>
      {hasHeader && (
        <div className="h-4 w-28 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4" />
      )}
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
            style={{ width: `${85 - i * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
};
