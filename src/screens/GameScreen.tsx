import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenBase, NeonText } from '@/components/ui';
import { Colors } from '@/theme';

export function GameScreen() {
  return (
    <ScreenBase edges={[]}>
      <View style={styles.root}>
        <NeonText preset="headingLarge" glow="primary" color={Colors.primary.DEFAULT}>
          Game Board
        </NeonText>
        <NeonText preset="bodyMedium" color={Colors.text.muted}>
          Hex grid coming in Chunk 3
        </NeonText>
      </View>
    </ScreenBase>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});
