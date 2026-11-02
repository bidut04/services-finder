export interface ColorPalette {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryBackground: string;
  secondary: string;
  accent: string;
  accentDark: string;
  accentLight: string;
  accentPeach: string;
  amber: string;
  navy: string;
  navyDark: string;
  navyLight: string;
  background: string;
  surface: string;
  surfaceCard: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderLight: string;
  emergency: string;
  emergencyLight: string;
  warning: string;
  success: string;
  successLight: string;
  teal: string;
  star: string;
}

export const LightTheme: ColorPalette = {
  // Clean_space theme (Light)
  primary: '#1E40AF',           // Vivid Royal Blue
  primaryDark: '#0F172A',       // Deep Navy Slate
  primaryLight: '#2563EB',      // Electric Royal Blue
  primaryBackground: '#EFF6FF', // Soft Sky Blue tint wash

  secondary: '#1E293B',
  accent: '#F97316',            // Warm Orange
  accentDark: '#EA580C',
  accentLight: '#FFEDD5',
  accentPeach: '#FFBD9B',
  amber: '#B45309',

  navy: '#0F172A',
  navyDark: '#0A0F1D',
  navyLight: '#1E293B',

  background: '#FDFBF9',        // Soft warm cream backdrop
  surface: '#FFFFFF',
  surfaceCard: '#FFFFFF',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  emergency: '#EF4444',
  emergencyLight: '#FEE2E2',
  warning: '#F59E0B',
  success: '#14B8A6',           // Teal Green (#14B8A6) · GPS detected and success indicator
  successLight: '#CCFBF1',      // Soft Teal wash
  teal: '#14B8A6',              // Teal Green accent
  star: '#F97316',
};

export const DarkTheme: ColorPalette = {
  // Clean_space theme (Dark)
  primary: '#3B82F6',           // Electric Sky Blue (high contrast on dark)
  primaryDark: '#1E40AF',
  primaryLight: '#60A5FA',
  primaryBackground: '#1E293B', // Dark slate blue wash

  secondary: '#94A3B8',
  accent: '#F97316',            // Warm Orange
  accentDark: '#EA580C',
  accentLight: '#3A2016',
  accentPeach: '#472C20',
  amber: '#F59E0B',

  navy: '#0F172A',
  navyDark: '#020617',
  navyLight: '#1E293B',

  background: '#0B0F17',        // Sleek Midnight Slate
  surface: '#131B2E',           // Elevated dark card
  surfaceCard: '#182238',

  textPrimary: '#F8FAFC',       // Crisp bright white-slate
  textSecondary: '#94A3B8',     // Muted slate
  textMuted: '#64748B',
  textInverse: '#0B0F17',

  border: '#1E293B',            // Subtle dark slate border
  borderLight: '#162032',

  emergency: '#EF4444',
  emergencyLight: '#451A1A',
  warning: '#F59E0B',
  success: '#14B8A6',           // Teal Green (#14B8A6) · GPS detected and success indicator
  successLight: 'rgba(20, 184, 166, 0.18)',
  teal: '#14B8A6',              // Teal Green accent
  star: '#F97316',
};

// Default export maintains compatibility with static styles
export const Colors: ColorPalette = LightTheme;
