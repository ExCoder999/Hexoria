import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenBase, BackButton, NeonText } from '@/components/ui';
import { Colors, Spacing } from '@/theme';

export function CardCollectionScreen() {
  return (
    <ScreenBase>
      <View style={styles.header}>
        <BackButton />
        <NeonText preset="headingLarge" glow="secondary" style={styles.title}>
          Collection
        </NeonText>
        <View style={styles.spacer} />
      </View>
      <View style={styles.body}>
        <NeonText preset="bodyMedium" color={Colors.text.muted}>
          Card collection coming in Chunk 4
        </NeonText>
      </View>
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
  title: { flex: 1, textAlign: 'center' },
  spacer: { width: 40, marginRight: Spacing[4] },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
