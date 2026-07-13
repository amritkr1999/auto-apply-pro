import { useState } from 'react';

export function useColorScheme(): 'light' | 'dark' {
  return 'light';
}

export function useTheme() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('light');
  return {
    colorScheme: 'light' as const,
    themeMode,
    setTheme: (theme: 'light' | 'dark' | 'system') => setThemeMode(theme),
    toggleTheme: () => {},
  };
}
