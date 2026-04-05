import React, { useState, useRef, useEffect } from 'react';
import { PROVIDERS } from '../data/providers';

function searchProviders(query: string) {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  return PROVIDERS.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.aliases?.some((a) => a.toLowerCase().includes(lower))
  ).slice(0, 8);
}

function getLogoUrl(domain: string) {
  return `https://logo.clearbit.com/${domain}`;
}

interface ProviderComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
}

export const ProviderCombobox: React.FC<ProviderComboboxProps> = ({
  value,
  onChange,
  onBlur,
  error,
  placeholder = 'e.g. Netflix Inc., TK',
}) => {
  const [suggestions, setSuggestions] = useState(searchProviders(value));
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSuggestions(searchProviders(value));
  }, [value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);
    const results = searchProviders(v);
    setSuggestions(results);
    setIsOpen(results.length > 0);
  };

  const handleSelect = (name: string) => {
    onChange(name);
    setIsOpen(false);
  };

  const handleBlurContainer = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
      onBlur?.();
    }
  };

  return (
    <div ref={containerRef} className="relative" onBlur={handleBlurContainer}>
      <input
        type="text"
        value={value}
        onChange={handleInput}
        onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
      />
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((provider) => (
            <ProviderOption
              key={provider.name}
              name={provider.name}
              logoUrl={getLogoUrl(provider.domain)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

interface ProviderOptionProps {
  name: string;
  logoUrl: string;
  onSelect: (name: string) => void;
}

const ProviderOption: React.FC<ProviderOptionProps> = ({ name, logoUrl, onSelect }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onMouseDown={() => onSelect(name)}
      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors text-left"
    >
      <div className="w-5 h-5 flex items-center justify-center shrink-0">
        {!imgError ? (
          <img
            src={logoUrl}
            alt={name}
            className="w-5 h-5 object-contain rounded"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
        )}
      </div>
      <span>{name}</span>
    </button>
  );
};
