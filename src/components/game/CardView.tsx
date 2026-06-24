import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { NeonText } from '@/components/ui';
import { Colors, Spacing, BorderRadius, TextStyle } from '@/theme';
import type { CardDefinition } from '@/types/game';
import { CARD_MAP } from '@/data/cards';

interface CardViewProps {
  instanceId: string;
  definitionId: string;
  isSelected?: boolean;
  isPlayable?: boolean;
  onPress?: (instanceId: string) => void;
  compact?: boolean;
}

const RARITY_COLORS: Record<string, [string, string]> = {
  common: ['#2A3A2A', '#1A2A1A'],
  uncommon: ['#1A2A3A', '#0A1A2A'],
  rare: ['#2A1A3A', '#1A0A2A'],
  legendary: ['#3A2A0A', '#2A1A00'],
};

const RARITY_BORDER: Record<string, string> = {
  common: Colors.glass.border,
  uncommon: Colors.primary.dim,
  rare: Colors.secondary.dim,
  legendary: Colors.accent.DEFAULT,
};

const TYPE_ICON: Record<string, string> = {
  unit: '⚔',
  spell: '✦',
  structure: '⬡',
  tactic: '◈',
};

export function CardView({
  instanceId,
  definitionId,
  isSelected = false,
  isPlayable = true,
  onPress,
  compact = false,
}: CardViewProps) {
  const def: CardDefinition | undefined = CARD_MAP[definitionId];
  const liftY = useSharedValue(0);
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: liftY.value }, { scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    liftY.value = withSpring(-12, { damping: 12, stiffness: 250 });
    scale.value = withSpring(1.04, { damping: 12, stiffness: 250 });
    Haptics.selectionAsync();
  }, [liftY, scale]);

  const handlePressOut = useCallback(() => {
    liftY.value = withSpring(isSelected ? -16 : 0, { damping: 12, stiffness: 250 });
    scale.value = withSpring(1, { damping: 12, stiffness: 250 });
  }, [liftY, scale, isSelected]);

  const handlePress = useCallback(() => {
    onPress?.(instanceId);
  }, [onPress, instanceId]);

  if (!def) return null;

  const [gradTop, gradBot] = RARITY_COLORS[def.rarity] ?? RARITY_COLORS.common;
  const borderColor = isSelected
    ? Colors.primary.DEFAULT
    : RARITY_BORDER[def.rarity] ?? Colors.glass.border;

  const cardH = compact ? 110 : 140;
  const cardW = compact ? 72 : 90;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={!isPlayable}
      >
        <LinearGradient
          colors={[gradTop, gradBot]}
          style={[
            styles.card,
            { width: cardW, height: cardH, borderColor },
            !isPlayable && styles.disabled,
            isSelected && styles.selected,
          ]}
        >
          {/* Cost row */}
          <View style={styles.costRow}>
            {def.cost.gold > 0 && (
              <NeonText preset="caption" color={Colors.warning} style={styles.costText}>
                {def.cost.gold}◈
              </NeonText>
            )}
            {def.cost.mana > 0 && (
              <NeonText preset="caption" color={Colors.primary.DEFAULT} style={styles.costText}>
                {def.cost.mana}✦
              </NeonText>
            )}
          </View>

          {/* Art placeholder */}
          <View style={[styles.art, { height: compact ? 40 : 52 }]}>
            <NeonText style={styles.artIcon}>
              {TYPE_ICON[def.type] ?? '?'}
            </NeonText>
          </View>

          {/* Name */}
          <NeonText
            preset="caption"
            style={[styles.name, { fontSize: compact ? 8 : 9 }]}
            numberOfLines={2}
          >
            {def.name}
          </NeonText>

          {/* Stats (units only) */}
          {def.type === 'unit' && !compact && (
            <View style={styles.statsRow}>
              <NeonText preset="caption" color={Colors.danger} style={styles.stat}>
                {def.attack}⚔
              </NeonText>
              <NeonText preset="caption" color={Colors.success} style={styles.stat}>
                {def.defense}🛡
              </NeonText>
            </View>
          )}

          {/* Rarity pip */}
          <View style={[styles.pip, { backgroundColor: borderColor }]} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    padding: Spacing[1.5],
    alignItems: 'center',
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.4,
  },
  selected: {
    shadowColor: Colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 12,
  },
  costRow: {
    flexDirection: 'row',
    gap: Spacing[1],
    alignSelf: 'flex-start',
  },
  costText: {
    fontSize: 8,
    fontWeight: '700',
  },
  art: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.glass.white,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing[1],
  },
  artIcon: {
    fontSize: 22,
    lineHeight: 28,
  },
  name: {
    textAlign: 'center',
    color: Colors.text.primary,
    fontWeight: '600',
    lineHeight: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[1],
  },
  stat: {
    fontSize: 8,
    fontWeight: '700',
  },
  pip: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
