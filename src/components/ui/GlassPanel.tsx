import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius } from '@/theme';

interface GlassPanelProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  borderWidth?: number;
  radius?: number;
}

export function GlassPanel({
  children,
  style,
  intensity = 20,
  borderWidth = 1,
  radius = BorderRadius.xl,
}: GlassPanelProps) {
  return (
    <View style={[styles.wrapper, { borderRadius: radius, borderWidth }, style]}>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[styles.overlay, { borderRadius: radius }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderColor: Colors.glass.border,
    backgroundColor: Colors.glass.white,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.glass.white,
  },
  content: {
    flex: 1,
  },
});
