export const Colors = {
  // Backgrounds
  bg: {
    base: '#0A0E1A',
    surface: '#0F1629',
    elevated: '#151D35',
    overlay: 'rgba(10, 14, 26, 0.85)',
  },

  // Brand
  primary: {
    DEFAULT: '#00F5FF',
    dim: '#00C4CC',
    glow: 'rgba(0, 245, 255, 0.25)',
    subtle: 'rgba(0, 245, 255, 0.08)',
  },
  secondary: {
    DEFAULT: '#7B2FFF',
    dim: '#6022CC',
    glow: 'rgba(123, 47, 255, 0.25)',
    subtle: 'rgba(123, 47, 255, 0.08)',
  },
  accent: {
    DEFAULT: '#FF6B35',
    dim: '#CC5628',
    glow: 'rgba(255, 107, 53, 0.25)',
    subtle: 'rgba(255, 107, 53, 0.08)',
  },

  // Semantic
  success: '#00E676',
  warning: '#FFD600',
  danger: '#FF1744',
  info: '#40C4FF',

  // Glass
  glass: {
    white: 'rgba(255, 255, 255, 0.06)',
    whiteMid: 'rgba(255, 255, 255, 0.10)',
    whiteStrong: 'rgba(255, 255, 255, 0.16)',
    border: 'rgba(255, 255, 255, 0.10)',
    borderStrong: 'rgba(255, 255, 255, 0.18)',
  },

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.70)',
    muted: 'rgba(255, 255, 255, 0.40)',
    disabled: 'rgba(255, 255, 255, 0.20)',
  },

  // Player colors
  player: {
    one: '#00F5FF',   // Cyan
    two: '#FF6B35',   // Orange
    three: '#00E676', // Green
    four: '#FFD600',  // Yellow
  },

  // Terrain
  terrain: {
    plains: '#1A2A1A',
    forest: '#0D2010',
    mountain: '#1A1520',
    water: '#0A1525',
    desert: '#251A0A',
    ruins: '#1A1210',
  },

  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof Colors;
