import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentsStore } from '../store/usePaymentsStore';
import { useGoalsStore } from '../store/useGoalsStore';
import { useHabitsStore } from '../store/useHabitsStore';
import { useDocumentsStore } from '../store/useDocumentsStore';
import { useIdeasStore } from '../store/useIdeasStore';

interface SearchResult {
  id: string;
  type: 'payment' | 'goal' | 'habit' | 'document' | 'idea';
  title: string;
  subtitle: string;
  icon: string;
  route: string;
}

const TYPE_LABELS: Record<SearchResult['type'], string> = {
  payment:  'Payment',
  goal:     'Goal',
  habit:    'Habit',
  document: 'Document',
  idea:     'Idea',
};

const TYPE_COLORS: Record<SearchResult['type'], string> = {
  payment:  'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
  goal:     'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400',
  habit:    'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
  document: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',
  idea:     'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400',
};

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { payments } = usePaymentsStore();
  const { goals } = useGoalsStore();
  const { habits } = useHabitsStore();
  const { documents } = useDocumentsStore();
  const { ideas } = useIdeasStore();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const out: SearchResult[] = [];

    payments.forEach((p) => {
      if ([p.name, p.provider, p.category, p.accountUsed].some((s) => s?.toLowerCase().includes(q))) {
        out.push({
          id: p.id, type: 'payment',
          title: p.name,
          subtitle: `${p.provider} · ${p.category} · ${p.country}`,
          icon: '💳', route: '/payments',
        });
      }
    });

    goals.forEach((g) => {
      if ([g.title, g.description, g.category].some((s) => s?.toLowerCase().includes(q))) {
        out.push({
          id: g.id, type: 'goal',
          title: g.title,
          subtitle: `${g.category} · ${g.status}`,
          icon: '🎯', route: '/goals-habits',
        });
      }
    });

    habits.filter((h) => !h.isArchived).forEach((h) => {
      if ([h.name, h.description, h.category].some((s) => s?.toLowerCase().includes(q))) {
        out.push({
          id: h.id, type: 'habit',
          title: `${h.icon} ${h.name}`,
          subtitle: `${h.category} · ${h.frequency}`,
          icon: '🔥', route: '/goals-habits',
        });
      }
    });

    documents.forEach((d) => {
      if ([d.name, d.issuer, d.category, d.documentNumber].some((s) => s?.toLowerCase().includes(q))) {
        out.push({
          id: d.id, type: 'document',
          title: d.name,
          subtitle: `${d.category} · ${d.country}`,
          icon: '🗂️', route: '/documents',
        });
      }
    });

    ideas.filter((i) => !i.isArchived).forEach((i) => {
      if (
        i.title.toLowerCase().includes(q) ||
        i.body.toLowerCase().includes(q) ||
        (i.tags ?? []).some((t) => t.includes(q))
      ) {
        out.push({
          id: i.id, type: 'idea',
          title: i.title,
          subtitle: i.body ? i.body.slice(0, 60) + (i.body.length > 60 ? '…' : '') : 'No description',
          icon: '💡', route: '/ideas',
        });
      }
    });

    return out.slice(0, 12);
  }, [query, payments, goals, habits, documents, ideas]);

  // Reset active index when results change
  useEffect(() => setActiveIndex(0), [results]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.route);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[activeIndex]) handleSelect(results[activeIndex]);
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-scale-in">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search payments, goals, habits, documents, ideas..."
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            Esc
          </kbd>
        </div>

        {/* Results */}
        {query.trim() && (
          <div className="max-h-[60vh] overflow-y-auto">
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No results for "{query}"</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try a different keyword</p>
              </div>
            ) : (
              <ul className="py-2">
                {results.map((result, idx) => (
                  <li key={`${result.type}-${result.id}`}>
                    <button
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${idx === activeIndex ? 'bg-indigo-50 dark:bg-indigo-950/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      <span className="text-xl shrink-0">{result.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{result.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.subtitle}</p>
                      </div>
                      <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[result.type]}`}>
                        {TYPE_LABELS[result.type]}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {!query.trim() && (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">Start typing to search across all your data</p>
          </div>
        )}
      </div>
    </div>
  );
};
