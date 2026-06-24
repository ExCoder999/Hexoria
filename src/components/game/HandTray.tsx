import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { NeonText } from '@/components/ui';
import { CardView } from './CardView';
import { Colors, Spacing, BorderRadius } from '@/theme';
import type { CardInstance, Resources } from '@/types/game';
import { CARD_MAP } from '@/data/cards';

interface HandTrayProps {
  hand: CardInstance[];
  resources: Resources;
  onPlayCard: (instanceId: string) => void;
}

function canAfford(cardId: string, resources: Resources): boolean {
  const def = CARD_MAP[cardId];
  if (!def) return false;
  return (
    resources.gold >= def.cost.gold &&
    resources.mana >= def.cost.mana &&
    resources.ore >= def.cost.ore
  );
}

export function HandTray({ hand, resources, onPlayCard }: HandTrayProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const trayHeight = useSharedValue(60);

  const trayStyle = useAnimatedStyle(() => ({
    height: trayHeight.value,
  }));

  const toggleExpanded = useCallback(() => {
    const next = !expanded;
    setExpanded(next);
    trayHeight.value = withSpring(next ? 200 : 60, { damping: 14, stiffness: 200 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [expanded, trayHeight]);

  const handleCardPress = useCallback(
    (instanceId: string) => {
      if (selectedId === instanceId) {
        // Second tap = play
        onPlayCard(instanceId);
        setSelectedId(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setSelectedId(instanceId);
        Haptics.selectionAsync();
      }
    },
    [selectedId, onPlayCard]
  );

  return (
    <View style={styles.root}>
      {/* Expand toggle */}
      <Pressable onPress={toggleExpanded} style={styles.toggle} hitSlop={12}>
        <View style={styles.handle} />
        <NeonText preset="caption" color={Colors.text.muted}>
          HAND ({hand.length})
        </NeonText>
      </Pressable>

      <Animated.View style={[styles.tray, trayStyle]}>
        {expanded && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >
            {hand.map((card) => (
              <CardView
                key={card.instanceId}
                instanceId={card.instanceId}
                definitionId={card.definitionId}
                isSelected={selectedId === card.instanceId}
                isPlayable={canAfford(card.definitionId, resources)}
                onPress={handleCardPress}
              />
            ))}
            {hand.length === 0 && (
              <NeonText preset="bodySmall" color={Colors.text.disabled} style={styles.empty}>
                No cards in hand
              </NeonText>
            )}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: `${Colors.bg.surface}EE`,
    borderTopWidth: 1,
    borderTopColor: Colors.glass.border,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    overflow: 'hidden',
  },
  toggle: {
    alignItems: 'center',
    paddingVertical: Spacing[2],
    gap: Spacing[1],
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.glass.borderStrong,
  },
  tray: {
    overflow: 'hidden',
  },
  scroll: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[4],
    gap: Spacing[3],
    alignItems: 'flex-end',
  },
  empty: {
    padding: Spacing[8],
    alignSelf: 'center',
  },
});
