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
    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
      {countries.map((country) => (
        <button
          key={country}
          onClick={() => onChange(country)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${
              activeCountry === country
                ? 'bg-white text-indigo-700 shadow-sm border border-gray-200/80'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/60'
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
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-200 text-gray-500'
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
