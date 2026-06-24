import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { Colors, TextStyle as TS } from '@/theme';

type Glow = 'primary' | 'secondary' | 'accent' | 'none';
type Preset = keyof typeof TS;

interface NeonTextProps {
  children: React.ReactNode;
  glow?: Glow;
  preset?: Preset;
  style?: TextStyle;
  color?: string;
}

const GLOW_COLOR: Record<Exclude<Glow, 'none'>, string> = {
  primary: Colors.primary.DEFAULT,
  secondary: Colors.secondary.DEFAULT,
  accent: Colors.accent.DEFAULT,
};

export function NeonText({
  children,
  glow = 'none',
  preset = 'bodyMedium',
  style,
  color,
}: NeonTextProps) {
  const glowStyle: TextStyle =
    glow !== 'none'
      ? {
          textShadowColor: GLOW_COLOR[glow],
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 10,
        }
      : {};

  return (
    <Text
      style={[
        TS[preset],
        styles.base,
        color ? { color } : undefined,
        glowStyle,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: Colors.text.primary,
  },
});
