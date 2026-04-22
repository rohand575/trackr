import React, { useState } from 'react';
import { addProgressLog } from '../../services/progressLogService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

interface Props {
  goalId: string;
  onClose: () => void;
}

const today = () => new Date().toISOString().split('T')[0];

export const WeightLogForm: React.FC<Props> = ({ goalId, onClose }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [date, setDate] = useState(today());
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const kg = parseFloat(value);
    if (isNaN(kg) || kg <= 0) return;
    setSaving(true);
    try {
      await addProgressLog(user.uid, goalId, { date, value: kg, ...(note.trim() ? { note: note.trim() } : {}) });
      addToast(`${kg} kg logged`, 'success');
      onClose();
    } catch {
      addToast('Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Log weight</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today()}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Weight (kg)</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 94.5"
            step="0.1"
            min="30"
            max="300"
            autoFocus
            className="w-full px-2.5 py-1.5 text-xs border border-indigo-300 dark:border-indigo-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
      </div>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note (e.g. feeling leaner)"
        className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving || !value}
          className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1.5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
