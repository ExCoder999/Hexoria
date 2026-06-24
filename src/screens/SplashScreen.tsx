import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { NeonText } from '@/components/ui';
import { Colors, Spacing } from '@/theme';
import type { RootStackParamList } from '@/types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export function SplashScreen() {
  const navigation = useNavigation<Nav>();
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.6);
  const taglineOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  useEffect(() => {
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 700 }));
    logoScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));
    taglineOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    glowOpacity.value = withDelay(400, withTiming(0.8, { duration: 1000 }));

    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.bg.base, Colors.bg.surface, Colors.bg.base]}
        style={StyleSheet.absoluteFill}
      />

      {/* Background glow */}
      <Animated.View style={[styles.glow, glowStyle]} />

      <Animated.View style={[styles.center, logoStyle]}>
        <NeonText
          preset="displayLarge"
          glow="primary"
          style={styles.logo}
          color={Colors.primary.DEFAULT}
        >
          HEXORIA
        </NeonText>
      </Animated.View>

      <Animated.View style={[styles.taglineWrap, taglineStyle]}>
        <NeonText
          preset="label"
          color={Colors.text.muted}
          style={styles.tagline}
        >
          Realm Conquest
        </NeonText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary.glow,
    shadowColor: Colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 80,
    elevation: 20,
  },
  center: {
    alignItems: 'center',
  },
  logo: {
    letterSpacing: 8,
  },
  taglineWrap: {
    position: 'absolute',
    bottom: '20%',
  },
  tagline: {
    letterSpacing: 6,
  },
});
