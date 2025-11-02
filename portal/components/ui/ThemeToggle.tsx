'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, resolvedTheme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use resolvedTheme to get the actual theme (resolves 'system' to 'light' or 'dark')
  // resolvedTheme is the actual active theme, not just the preference
  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === 'dark';

  // Note: We don't manually manage the 'dark' class here
  // next-themes handles this automatically via the ThemeProvider
  // The attribute="class" prop tells next-themes to add/remove the 'dark' class

  if (!mounted) {
    // Show a neutral state during SSR to avoid hydration mismatch
    return (
      <button
        className="
          inline-flex items-center justify-center
          w-10 h-10 rounded-lg
          bg-gray-100 hover:bg-gray-200
          dark:bg-gray-800 dark:hover:bg-gray-700
          text-gray-700 dark:text-gray-300
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          dark:focus:ring-offset-gray-800
        "
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="
        inline-flex items-center justify-center
        w-10 h-10 rounded-lg
        bg-gray-100 hover:bg-gray-200
        dark:bg-gray-800 dark:hover:bg-gray-700
        text-gray-700 dark:text-gray-300
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        dark:focus:ring-offset-gray-800
      "
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
