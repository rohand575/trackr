import React from 'react';

interface EmptyStateProps {
  hasFilters: boolean;
  onAddClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ hasFilters, onAddClick }) => {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">No results found</h3>
        <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/50 rounded-3xl flex items-center justify-center mb-5">
        <svg className="w-10 h-10 text-indigo-400 dark:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">No subscriptions yet</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-xs">
        Add your first subscription to start tracking your recurring expenses
      </p>
      <button
        onClick={onAddClick}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-200"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Add Subscription
      </button>
    </div>
  );
};
