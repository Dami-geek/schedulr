import React, { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

const storageKey = 'schedulr_theme';

const getStoredTheme = (): 'light' | 'dark' | null => {
  try {
    const v = localStorage.getItem(storageKey);
    if (v === 'light' || v === 'dark') return v;
    return null;
  } catch {
    return null;
  }
};

const setStoredTheme = (v: 'light' | 'dark') => {
  try {
    localStorage.setItem(storageKey, v);
  } catch {}
};

const applyTheme = (v: 'light' | 'dark') => {
  document.documentElement.setAttribute('data-theme', v);
};

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getStoredTheme() || 'light');

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleToggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    setStoredTheme(next);
  };

  const isDark = theme === 'dark';

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center space-x-1 rounded-md px-2 py-1 transition-colors duration-300 ${isDark ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      role="switch"
      aria-checked={isDark}
    >
      {isDark ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
      <span className="text-xs">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
};

export default ThemeToggle;