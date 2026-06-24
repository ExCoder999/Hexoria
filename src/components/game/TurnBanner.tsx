import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { GlassPanel, NeonText } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/theme';

interface TurnBannerProps {
  playerName: string;
  turn: number;
  playerColor: string;
  visible: boolean;
}

export function TurnBanner({ playerName, turn, playerColor, visible }: TurnBannerProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (visible) {
      opacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(1, { duration: 1800 }),
        withTiming(0, { duration: 400 })
      );
      translateY.value = withSequence(
        withTiming(0, { duration: 300 }),
        withTiming(0, { duration: 1800 }),
        withTiming(-20, { duration: 400 })
      );
    }
  }, [visible, playerName]);

  return (
    <Animated.View style={[styles.root, animStyle]} pointerEvents="none">
      <GlassPanel radius={BorderRadius['2xl']} style={[styles.panel, { borderColor: playerColor }]}>
        <View style={styles.inner}>
          <NeonText preset="label" color={Colors.text.muted}>
            TURN {turn}
          </NeonText>
          <NeonText preset="headingMedium" color={playerColor}>
            {playerName}'s Turn
          </NeonText>
        </View>
      </GlassPanel>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: Spacing[12],
    alignSelf: 'center',
    zIndex: 100,
  },
  panel: {
    flex: 0,
  },
  inner: {
    paddingHorizontal: Spacing[8],
    paddingVertical: Spacing[4],
    alignItems: 'center',
    gap: Spacing[1],
  },
});
