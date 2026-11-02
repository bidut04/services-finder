import { create } from 'zustand';
import { ColorPalette, LightTheme, DarkTheme } from './colors';

export type ThemeMode = 'light' | 'dark';

export interface ThemeState {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ColorPalette;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: 'light',
  isDark: false,
  colors: LightTheme,

  toggleTheme: () =>
    set((state) => {
      const nextMode: ThemeMode = state.themeMode === 'light' ? 'dark' : 'light';
      return {
        themeMode: nextMode,
        isDark: nextMode === 'dark',
        colors: nextMode === 'dark' ? DarkTheme : LightTheme,
      };
    }),

  setThemeMode: (mode: ThemeMode) =>
    set({
      themeMode: mode,
      isDark: mode === 'dark',
      colors: mode === 'dark' ? DarkTheme : LightTheme,
    }),
}));

export const useTheme = () => {
  const themeMode = useThemeStore((s) => s.themeMode);
  const isDark = useThemeStore((s) => s.isDark);
  const colors = useThemeStore((s) => s.colors);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);

  return {
    themeMode,
    isDark,
    colors,
    toggleTheme,
    setThemeMode,
  };
};
