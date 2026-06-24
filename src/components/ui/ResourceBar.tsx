import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Resources } from '@/types/game';
import { Colors, Spacing, TextStyle, BorderRadius } from '@/theme';
import { GlassPanel } from './GlassPanel';

interface ResourceBarProps {
  resources: Resources;
}

interface ResourceChipProps {
  icon: string;
  value: number;
  color: string;
}

function ResourceChip({ icon, value, color }: ResourceChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={[styles.icon, { color }]}>{icon}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

export function ResourceBar({ resources }: ResourceBarProps) {
  return (
    <GlassPanel style={styles.panel} radius={BorderRadius['2xl']}>
      <View style={styles.row}>
        <ResourceChip icon="◈" value={resources.gold} color={Colors.warning} />
        <View style={styles.divider} />
        <ResourceChip icon="✦" value={resources.mana} color={Colors.primary.DEFAULT} />
        <View style={styles.divider} />
        <ResourceChip icon="⬡" value={resources.ore} color={Colors.text.secondary} />
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    gap: Spacing[3],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
  },
  icon: {
    ...TextStyle.bodyMedium,
    lineHeight: 20,
  },
  value: {
    ...TextStyle.bodyMedium,
    fontWeight: '700',
    minWidth: 24,
    color: Colors.text.primary,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.glass.border,
  },
});
