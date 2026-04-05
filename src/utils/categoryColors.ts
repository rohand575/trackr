import type { Category } from '../types/subscription';

export const categoryConfig: Record<Category, { color: string; bg: string; icon: string }> = {
  Health: { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40', icon: '🏥' },
  Transport: { color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/40', icon: '🚇' },
  Entertainment: { color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40', icon: '🎬' },
  Utilities: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', icon: '⚡' },
  Insurance: { color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/40', icon: '🛡️' },
  Education: { color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40', icon: '📚' },
  Finance: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/40', icon: '💰' },
  Food: { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/40', icon: '🍔' },
  Shopping: { color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/40', icon: '🛍️' },
  Technology: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40', icon: '💻' },
  Communication: { color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/40', icon: '📱' },
  Other: { color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800', icon: '📦' },
};

export const getCategoryConfig = (category: Category) =>
  categoryConfig[category] ?? categoryConfig.Other;
