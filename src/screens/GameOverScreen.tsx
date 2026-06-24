import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ScreenBase, NeonText, NeonButton } from '@/components/ui';
import { Colors, Spacing } from '@/theme';
import type { RootStackParamList } from '@/types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'GameOver'>;
type Route = RouteProp<RootStackParamList, 'GameOver'>;

export function GameOverScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { winnerId } = route.params;

  return (
    <ScreenBase>
      <View style={styles.root}>
        <NeonText preset="displayMedium" glow="primary" color={Colors.primary.DEFAULT}>
          Victory!
        </NeonText>
        <NeonText preset="bodyLarge" color={Colors.text.secondary}>
          {winnerId} wins the realm
        </NeonText>
        <View style={styles.btns}>
          <NeonButton
            label="Play Again"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => navigation.navigate('ModeSelect')}
          />
          <NeonButton
            label="Main Menu"
            variant="ghost"
            size="md"
            fullWidth
            onPress={() => navigation.navigate('Home')}
          />
        </View>
      </View>
    </ScreenBase>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[8],
    gap: Spacing[4],
  },
  btns: {
    width: '100%',
    gap: Spacing[3],
    marginTop: Spacing[8],
  },
});
