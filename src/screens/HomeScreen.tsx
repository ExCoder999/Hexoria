import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBase, NeonButton, NeonText, GlassPanel } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/theme';
import type { RootStackParamList } from '@/types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(30);
  const btnsOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const btnsStyle = useAnimatedStyle(() => ({
    opacity: btnsOpacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 0.3 + (pulseScale.value - 1) * 3,
  }));

  useEffect(() => {
    titleOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    titleY.value = withDelay(100, withTiming(0, { duration: 600 }));
    btnsOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      false
    );
  }, []);

  return (
    <ScreenBase>
      {/* Background pulse glow */}
      <Animated.View style={[styles.bgGlow, pulseStyle]} />

      <View style={styles.root}>
        {/* Header */}
        <Animated.View style={[styles.header, titleStyle]}>
          <NeonText
            preset="displayLarge"
            glow="primary"
            color={Colors.primary.DEFAULT}
            style={styles.title}
          >
            HEXORIA
          </NeonText>
          <NeonText preset="label" color={Colors.text.muted} style={styles.sub}>
            Realm Conquest
          </NeonText>
        </Animated.View>

        {/* Hex Grid Preview Placeholder */}
        <View style={styles.previewWrap}>
          <LinearGradient
            colors={[Colors.primary.subtle, Colors.secondary.subtle]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.previewBg}
          />
          <NeonText preset="displaySmall" color={Colors.primary.dim} style={styles.previewHex}>
            ⬡
          </NeonText>
        </View>

        {/* Buttons */}
        <Animated.View style={[styles.buttons, btnsStyle]}>
          <NeonButton
            label="Play"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => navigation.navigate('ModeSelect')}
          />
          <NeonButton
            label="Deck Builder"
            variant="secondary"
            size="lg"
            fullWidth
            onPress={() => navigation.navigate('DeckBuilder')}
          />
          <NeonButton
            label="Leaderboard"
            variant="ghost"
            size="md"
            fullWidth
            onPress={() => navigation.navigate('Leaderboard')}
          />
          <NeonButton
            label="Settings"
            variant="ghost"
            size="md"
            fullWidth
            onPress={() => navigation.navigate('Settings')}
          />
        </Animated.View>

        {/* Version */}
        <NeonText preset="caption" color={Colors.text.disabled} style={styles.version}>
          v1.0.0
        </NeonText>
      </View>
    </ScreenBase>
  );
}

const styles = StyleSheet.create({
  bgGlow: {
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.primary.glow,
  },
  root: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    justifyContent: 'space-between',
    paddingTop: Spacing[12],
    paddingBottom: Spacing[8],
  },
  header: {
    alignItems: 'center',
    gap: Spacing[1],
  },
  title: {
    letterSpacing: 8,
  },
  sub: {
    letterSpacing: 5,
    marginTop: Spacing[1],
  },
  previewWrap: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing[6],
    borderRadius: BorderRadius['3xl'],
    overflow: 'hidden',
  },
  previewBg: {
    ...StyleSheet.absoluteFillObject,
  },
  previewHex: {
    fontSize: 100,
    lineHeight: 110,
  },
  buttons: {
    gap: Spacing[3],
  },
  version: {
    textAlign: 'center',
    marginTop: Spacing[4],
  },
});
