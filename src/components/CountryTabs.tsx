import React from 'react';
import type { Country } from '../types/subscription';

interface CountryTabsProps {
  activeCountry: Country;
  onChange: (country: Country) => void;
  counts: Record<Country, number>;
}

const countryFlags: Record<Country, string> = {
  Germany: '🇩🇪',
  India: '🇮🇳',
};

const countries: Country[] = ['Germany', 'India'];

export const CountryTabs: React.FC<CountryTabsProps> = ({ activeCountry, onChange, counts }) => {
  return (
    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
      {countries.map((country) => (
        <button
          key={country}
          onClick={() => onChange(country)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${
              activeCountry === country
                ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 shadow-sm border border-gray-200/80 dark:border-gray-600/50'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-700/50'
            }
          `}
        >
          <span className="text-base leading-none">{countryFlags[country]}</span>
          <span>{country}</span>
          <span
            className={`
              inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold
              ${
                activeCountry === country
                  ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }
            `}
          >
            {counts[country]}
          </span>
        </button>
      ))}
    </div>
  );
};
