import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, TextStyle as TS, Spacing } from '@/theme';

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface NeonButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const VARIANT_COLORS: Record<Variant, [string, string]> = {
  primary: [Colors.primary.dim, Colors.primary.DEFAULT],
  secondary: [Colors.secondary.dim, Colors.secondary.DEFAULT],
  accent: [Colors.accent.dim, Colors.accent.DEFAULT],
  ghost: ['transparent', 'transparent'],
  danger: ['#CC0022', Colors.danger],
};

const SIZE_CONFIG: Record<Size, { paddingH: number; paddingV: number; textStyle: TextStyle }> = {
  sm: { paddingH: Spacing[4], paddingV: Spacing[2], textStyle: TS.bodySmall },
  md: { paddingH: Spacing[6], paddingV: Spacing[3], textStyle: TS.bodyMedium },
  lg: { paddingH: Spacing[8], paddingV: Spacing[4], textStyle: TS.bodyLarge },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function NeonButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
}: NeonButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.85, { duration: 80 });
  }, [scale, opacity]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 150 });
  }, [scale, opacity]);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [disabled, loading, onPress]);

  const sizeConfig = SIZE_CONFIG[size];
  const [gradStart, gradEnd] = VARIANT_COLORS[variant];
  const isGhost = variant === 'ghost';
  const glowColor = Colors.primary.glow;

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        animStyle,
        styles.base,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={[gradStart, gradEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            paddingHorizontal: sizeConfig.paddingH,
            paddingVertical: sizeConfig.paddingV,
            borderRadius: BorderRadius.lg,
            borderWidth: isGhost ? 1 : 0,
            borderColor: isGhost ? Colors.glass.borderStrong : undefined,
          },
          !isGhost && { shadowColor: glowColor, ...styles.glow },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.text.primary} size="small" />
        ) : (
          <View style={styles.row}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text
              style={[
                sizeConfig.textStyle,
                styles.label,
                isGhost && { color: Colors.text.secondary },
                textStyle,
              ]}
            >
              {label}
            </Text>
          </View>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.4,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  icon: {
    marginRight: Spacing[1],
  },
  label: {
    color: Colors.text.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
