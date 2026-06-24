import { Platform } from 'react-native';

export const FontFamily = {
  regular: Platform.select({ ios: 'System', android: 'sans-serif' }),
  medium: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  bold: Platform.select({ ios: 'System', android: 'sans-serif-bold' }),
  mono: Platform.select({ ios: 'Courier New', android: 'monospace' }),
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
  caps: 3,
} as const;

export const TextStyle = {
  displayLarge: {
    fontSize: FontSize['5xl'],
    lineHeight: FontSize['5xl'] * LineHeight.tight,
    letterSpacing: LetterSpacing.tight,
    fontWeight: '800' as const,
  },
  displayMedium: {
    fontSize: FontSize['4xl'],
    lineHeight: FontSize['4xl'] * LineHeight.tight,
    letterSpacing: LetterSpacing.tight,
    fontWeight: '700' as const,
  },
  displaySmall: {
    fontSize: FontSize['3xl'],
    lineHeight: FontSize['3xl'] * LineHeight.tight,
    letterSpacing: LetterSpacing.normal,
    fontWeight: '700' as const,
  },
  headingLarge: {
    fontSize: FontSize['2xl'],
    lineHeight: FontSize['2xl'] * LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
    fontWeight: '700' as const,
  },
  headingMedium: {
    fontSize: FontSize.xl,
    lineHeight: FontSize.xl * LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
    fontWeight: '600' as const,
  },
  headingSmall: {
    fontSize: FontSize.lg,
    lineHeight: FontSize.lg * LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontSize: FontSize.lg,
    lineHeight: FontSize.lg * LineHeight.relaxed,
    letterSpacing: LetterSpacing.normal,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * LineHeight.relaxed,
    letterSpacing: LetterSpacing.normal,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * LineHeight.relaxed,
    letterSpacing: LetterSpacing.normal,
    fontWeight: '400' as const,
  },
  label: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * LineHeight.normal,
    letterSpacing: LetterSpacing.caps,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
    fontWeight: '400' as const,
  },
} as const;
