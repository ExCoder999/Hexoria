import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenBase, BackButton, NeonText, GlassPanel, NeonButton } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/theme';
import type { RootStackParamList } from '@/types/navigation';
import { useOnlineMatch } from '@/services/online/useOnlineMatch';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Lobby'>;

const MOCK_PLAYER_ID = 'local_player';
const MOCK_DISPLAY_NAME = 'You';
const MOCK_ELO = 1000;

function PulsingDot({ delay = 0, color = Colors.primary.DEFAULT }: { delay?: number; color?: string }) {
  const opacity = useSharedValue(0.2);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: delay }),
        withTiming(1, { duration: 400 }),
        withTiming(0.2, { duration: 400 })
      ),
      -1,
      false
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: delay }),
        withTiming(1.2, { duration: 400 }),
        withTiming(0.8, { duration: 400 })
      ),
      -1,
      false
    );
  }, [delay]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }, style]}
    />
  );
}

export function LobbyScreen() {
  const navigation = useNavigation<Nav>();
  const { state, joinQueue, leaveQueue } = useOnlineMatch(
    MOCK_PLAYER_ID,
    MOCK_DISPLAY_NAME,
    MOCK_ELO
  );
  const searchTime = useRef(0);
  const [elapsed, setElapsed] = React.useState(0);

  useEffect(() => {
    joinQueue();
    return () => leaveQueue();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      searchTime.current += 1;
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusText: Record<string, string> = {
    searching: 'Finding opponent...',
    found: 'Opponent found!',
    connecting: 'Connecting...',
    active: 'Starting game...',
    finished: 'Match ended',
    error: state.error ?? 'Connection error',
  };

  const dotColor =
    state.status === 'found' || state.status === 'active'
      ? Colors.success
      : state.status === 'error'
      ? Colors.danger
      : Colors.primary.DEFAULT;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <ScreenBase>
      <View style={styles.header}>
        <BackButton onPress={() => { leaveQueue(); navigation.goBack(); }} />
        <NeonText preset="headingLarge" glow="secondary" style={styles.title}>
          Online Lobby
        </NeonText>
        <View style={styles.spacer} />
      </View>

      <View style={styles.body}>
        {/* Matchmaking card */}
        <GlassPanel style={styles.card} radius={BorderRadius['3xl']}>
          <View style={styles.cardInner}>
            {/* Dots animation */}
            <View style={styles.dots}>
              <PulsingDot delay={0} color={dotColor} />
              <PulsingDot delay={150} color={dotColor} />
              <PulsingDot delay={300} color={dotColor} />
            </View>

            <NeonText preset="headingMedium" glow="primary" color={Colors.primary.DEFAULT}>
              {statusText[state.status] ?? 'Searching...'}
            </NeonText>

            {state.status === 'searching' && (
              <NeonText preset="bodySmall" color={Colors.text.muted}>
                Search time: {formatTime(elapsed)}
              </NeonText>
            )}

            {(state.status === 'found' || state.status === 'active') && state.opponentName && (
              <View style={styles.opponentInfo}>
                <NeonText preset="bodyMedium" color={Colors.text.secondary}>
                  vs
                </NeonText>
                <NeonText preset="headingSmall" glow="accent" color={Colors.accent.DEFAULT}>
                  {state.opponentName}
                </NeonText>
                {state.opponentElo && (
                  <NeonText preset="caption" color={Colors.text.muted}>
                    ELO {state.opponentElo}
                  </NeonText>
                )}
              </View>
            )}

            {state.status === 'error' && (
              <NeonButton
                label="Retry"
                variant="primary"
                size="md"
                onPress={joinQueue}
                style={styles.btn}
              />
            )}
          </View>
        </GlassPanel>

        {/* Player info */}
        <GlassPanel style={styles.playerCard} radius={BorderRadius['2xl']}>
          <View style={styles.playerInner}>
            <View style={styles.playerRow}>
              <View style={[styles.avatar, { backgroundColor: Colors.primary.subtle }]}>
                <NeonText color={Colors.primary.DEFAULT} preset="headingSmall">
                  {MOCK_DISPLAY_NAME[0]}
                </NeonText>
              </View>
              <View>
                <NeonText preset="headingSmall">{MOCK_DISPLAY_NAME}</NeonText>
                <NeonText preset="caption" color={Colors.text.muted}>
                  ELO {MOCK_ELO}
                </NeonText>
              </View>
            </View>
          </View>
        </GlassPanel>

        <NeonButton
          label="Cancel"
          variant="ghost"
          size="md"
          fullWidth
          onPress={() => { leaveQueue(); navigation.goBack(); }}
        />
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
  body: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    justifyContent: 'center',
    gap: Spacing[6],
  },
  card: { flex: 0 },
  cardInner: {
    padding: Spacing[10],
    alignItems: 'center',
    gap: Spacing[5],
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginBottom: Spacing[2],
  },
  opponentInfo: {
    alignItems: 'center',
    gap: Spacing[1],
  },
  btn: {
    marginTop: Spacing[4],
  },
  playerCard: { flex: 0 },
  playerInner: {
    padding: Spacing[5],
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary.dim,
  },
});
