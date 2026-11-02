import { TextStyle, Platform } from 'react-native';

export const FontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
};

// Clean platform-aware font family resolver
const getFontFamily = (weightKey: keyof typeof FontFamily) => {
  return Platform.select({
    web: `'Plus Jakarta Sans', ${FontFamily[weightKey]}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
    default: FontFamily[weightKey],
  });
};

export interface TypographyVariants {
  hero: TextStyle;
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  bodyLarge: TextStyle;
  body: TextStyle;
  bodySmall: TextStyle;
  caption: TextStyle;
  button: TextStyle;
  tag: TextStyle;
  counter: TextStyle;
}

export const Typography: TypographyVariants = {
  // Bold Taxidiaa editorial hero headline
  hero: {
    fontFamily: getFontFamily('extraBold'),
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  h1: {
    fontFamily: getFontFamily('bold'),
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  h2: {
    fontFamily: getFontFamily('bold'),
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: getFontFamily('semiBold'),
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  bodyLarge: {
    fontFamily: getFontFamily('regular'),
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 25,
    letterSpacing: -0.1,
  },
  body: {
    fontFamily: getFontFamily('regular'),
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
  },
  bodySmall: {
    fontFamily: getFontFamily('medium'),
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  caption: {
    fontFamily: getFontFamily('semiBold'),
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
    letterSpacing: 0.2,
  },
  button: {
    fontFamily: getFontFamily('bold'),
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    letterSpacing: 0.2,
  },
  tag: {
    fontFamily: getFontFamily('semiBold'),
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  counter: {
    fontFamily: getFontFamily('extraBold'),
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 44,
    letterSpacing: -0.8,
  },
};
