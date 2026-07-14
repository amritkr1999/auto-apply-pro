import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'app-theme-preference';

// Keep the original hook signature (returns string 'light' | 'dark') for backward compatibility
export const useColorScheme = (): 'light' | 'dark' => {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();

  // Load the persisted preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
          setColorScheme(savedTheme);
        }
      } catch (e) {
        console.log('Error reading theme preference:', e);
      }
    };
    loadTheme();
  }, []);

  return colorScheme === 'dark' ? 'dark' : 'light';
};

// Custom hook to support setting specific modes (light, dark, system) and persistence
export const useTheme = () => {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');

  // Load the persisted preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
          setThemeMode(savedTheme);
        }
      } catch (e) {
        console.log('Error reading theme preference:', e);
      }
    };
    loadTheme();
  }, []);

  const changeTheme = async (newTheme: 'light' | 'dark' | 'system') => {
    try {
      setThemeMode(newTheme);
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, newTheme);
      setColorScheme(newTheme);
    } catch (e) {
      console.log('Error saving theme preference:', e);
    }
  };

  const toggleTheme = async () => {
    const nextTheme = colorScheme === 'dark' ? 'light' : 'dark';
    await changeTheme(nextTheme);
  };

  return {
    colorScheme: colorScheme || 'light', // resolved active theme: 'light' | 'dark'
    themeMode,                           // preference: 'light' | 'dark' | 'system'
    setTheme: changeTheme,
    toggleTheme,
  };
};
