import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/theme';

interface ScreenBaseProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  withGradient?: boolean;
}

export function ScreenBase({
  children,
  style,
  contentStyle,
  edges = ['top', 'bottom'],
  withGradient = true,
}: ScreenBaseProps) {
  return (
    <View style={[styles.root, style]}>
      {withGradient && (
        <LinearGradient
          colors={[Colors.bg.base, Colors.bg.surface, Colors.bg.base]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
      )}
      <SafeAreaView style={[styles.safeArea, contentStyle]} edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg.base,
  },
  safeArea: {
    flex: 1,
  },
});
