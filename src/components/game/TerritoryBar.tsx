import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { GlassPanel, NeonText } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/theme';
import type { Player } from '@/types/game';

interface TerritoryBarProps {
  players: Player[];
  playerColors: Record<string, string>;
  totalTiles: number;
  victoryThreshold: number;
}

export function TerritoryBar({
  players,
  playerColors,
  totalTiles,
  victoryThreshold,
}: TerritoryBarProps) {
  return (
    <GlassPanel radius={BorderRadius.xl} style={styles.panel}>
      <View style={styles.inner}>
        <NeonText preset="caption" color={Colors.text.muted} style={styles.label}>
          TERRITORY
        </NeonText>

        {/* Progress bar */}
        <View style={styles.barTrack}>
          {players.map((p) => {
            const pct = totalTiles > 0 ? (p.territoryCount / totalTiles) * 100 : 0;
            return (
              <View
                key={p.id}
                style={[
                  styles.barSegment,
                  {
                    width: `${pct}%`,
                    backgroundColor: playerColors[p.id] ?? Colors.text.muted,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Victory threshold marker */}
        <View
          style={[
            styles.threshold,
            { left: `${victoryThreshold}%` },
          ]}
        />

        {/* Player scores */}
        <View style={styles.scores}>
          {players.map((p) => (
            <View key={p.id} style={styles.score}>
              <View
                style={[styles.dot, { backgroundColor: playerColors[p.id] ?? Colors.text.muted }]}
              />
              <NeonText preset="caption" color={Colors.text.secondary}>
                {p.name}: {p.territoryCount}
              </NeonText>
            </View>
          ))}
        </View>
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  panel: { flex: 0 },
  inner: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  label: { marginBottom: Spacing[0.5] },
  barTrack: {
    height: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.glass.white,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  barSegment: {
    height: '100%',
  },
  threshold: {
    position: 'absolute',
    top: 30,
    width: 2,
    height: 10,
    backgroundColor: Colors.warning,
    borderRadius: 1,
  },
  scores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  score: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
