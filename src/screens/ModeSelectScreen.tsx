import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { ScreenBase, GlassPanel, NeonText, BackButton } from '@/components/ui';
import { Colors, Spacing, BorderRadius, TextStyle } from '@/theme';
import type { RootStackParamList } from '@/types/navigation';
import type { GameMode } from '@/types/game';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ModeSelect'>;

interface ModeCard {
  mode: GameMode;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  glow: string;
  connectivity: string;
}

const MODES: ModeCard[] = [
  {
    mode: 'solo',
    title: 'Solo Campaign',
    subtitle: '40 missions vs AI — no internet required',
    icon: '⚔',
    color: Colors.primary.DEFAULT,
    glow: Colors.primary.glow,
    connectivity: 'OFFLINE',
  },
  {
    mode: 'online',
    title: 'Online Battle',
    subtitle: 'Global ranked 1v1 and co-op 2v2',
    icon: '⬡',
    color: Colors.secondary.DEFAULT,
    glow: Colors.secondary.glow,
    connectivity: 'ONLINE',
  },
  {
    mode: 'bluetooth',
    title: 'Bluetooth Duel',
    subtitle: 'Face-to-face local play — no internet needed',
    icon: '◈',
    color: Colors.accent.DEFAULT,
    glow: Colors.accent.glow,
    connectivity: 'BLUETOOTH',
  },
  {
    mode: 'pass-and-play',
    title: 'Pass & Play',
    subtitle: 'Two players on one device',
    icon: '✦',
    color: Colors.success,
    glow: 'rgba(0, 230, 118, 0.25)',
    connectivity: 'LOCAL',
  },
];

export function ModeSelectScreen() {
  const navigation = useNavigation<Nav>();

  const handleSelect = (mode: GameMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (mode === 'bluetooth') {
      navigation.navigate('BluetoothLobby');
    } else if (mode === 'online') {
      navigation.navigate('Lobby', { mode });
    } else {
      navigation.navigate('Game', { mode, difficulty: 'medium' });
    }
  };

  return (
    <ScreenBase>
      <View style={styles.header}>
        <BackButton />
        <NeonText preset="headingLarge" glow="primary" style={styles.title}>
          Choose Mode
        </NeonText>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {MODES.map((m) => (
          <Pressable
            key={m.mode}
            onPress={() => handleSelect(m.mode)}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <GlassPanel style={[styles.card, { shadowColor: m.glow }]} radius={BorderRadius['2xl']}>
              <View style={styles.cardInner}>
                <View style={[styles.iconWrap, { backgroundColor: m.glow }]}>
                  <NeonText style={[styles.icon, { color: m.color }]} preset="displaySmall">
                    {m.icon}
                  </NeonText>
                </View>
                <View style={styles.cardText}>
                  <NeonText preset="headingSmall" color={m.color}>
                    {m.title}
                  </NeonText>
                  <NeonText preset="bodySmall" color={Colors.text.secondary} style={styles.sub}>
                    {m.subtitle}
                  </NeonText>
                </View>
                <View style={[styles.badge, { backgroundColor: `${m.color}22`, borderColor: m.color }]}>
                  <NeonText preset="caption" color={m.color}>
                    {m.connectivity}
                  </NeonText>
                </View>
              </View>
            </GlassPanel>
          </Pressable>
        ))}
      </ScrollView>
    </ScreenBase>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[4],
    paddingRight: Spacing[6],
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    width: 40,
    marginRight: Spacing[4],
  },
  scroll: {
    padding: Spacing[6],
    gap: Spacing[4],
    paddingBottom: Spacing[12],
  },
  card: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[5],
    gap: Spacing[4],
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    lineHeight: 36,
    fontSize: 28,
  },
  cardText: {
    flex: 1,
    gap: Spacing[0.5],
  },
  sub: {
    marginTop: Spacing[0.5],
  },
  badge: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[0.5],
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
