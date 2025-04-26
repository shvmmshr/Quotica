'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // After mounting, we have access to the theme
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-full bg-white hover:bg-gray-100 border"
        aria-label="Toggle theme"
        suppressHydrationWarning
      >
        <Moon size={18} />
      </button>
    );
  }

  // Get the current effective theme, accounting for system setting
  const effectiveTheme = theme === 'system' ? resolvedTheme : theme;

  // Toggle between light and dark only, preserving system setting if that's what's active
  const toggleTheme = () => {
    if (theme === 'system') {
      // If system is active, switch to the opposite of the resolved theme
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else {
      // Just toggle between light and dark
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`cursor-pointer p-2 rounded-full ${
        effectiveTheme === 'dark'
          ? 'bg-gray-800 hover:bg-gray-700'
          : 'bg-white hover:bg-gray-100 border'
      }`}
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      {effectiveTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
