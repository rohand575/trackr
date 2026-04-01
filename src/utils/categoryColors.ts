import type { Category } from '../types/subscription';

export const categoryConfig: Record<Category, { color: string; bg: string; icon: string }> = {
  Health: { color: 'text-rose-600', bg: 'bg-rose-50', icon: '🏥' },
  Transport: { color: 'text-sky-600', bg: 'bg-sky-50', icon: '🚇' },
  Entertainment: { color: 'text-purple-600', bg: 'bg-purple-50', icon: '🎬' },
  Utilities: { color: 'text-amber-600', bg: 'bg-amber-50', icon: '⚡' },
  Insurance: { color: 'text-teal-600', bg: 'bg-teal-50', icon: '🛡️' },
  Education: { color: 'text-indigo-600', bg: 'bg-indigo-50', icon: '📚' },
  Finance: { color: 'text-green-600', bg: 'bg-green-50', icon: '💰' },
  Food: { color: 'text-orange-600', bg: 'bg-orange-50', icon: '🍔' },
  Shopping: { color: 'text-pink-600', bg: 'bg-pink-50', icon: '🛍️' },
  Technology: { color: 'text-blue-600', bg: 'bg-blue-50', icon: '💻' },
  Communication: { color: 'text-cyan-600', bg: 'bg-cyan-50', icon: '📱' },
  Other: { color: 'text-gray-600', bg: 'bg-gray-50', icon: '📦' },
};

export const getCategoryConfig = (category: Category) =>
  categoryConfig[category] ?? categoryConfig.Other;
