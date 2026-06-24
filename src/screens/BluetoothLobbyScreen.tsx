import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { ScreenBase, BackButton, NeonText, GlassPanel, NeonButton } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/theme';
import type { RootStackParamList } from '@/types/navigation';
import type { BLEPeer } from '@/types/game';
import { useBluetooth } from '@/services/bluetooth/useBluetooth';

type Nav = NativeStackNavigationProp<RootStackParamList, 'BluetoothLobby'>;

type Mode = 'choose' | 'host' | 'scan';

function RadarRing({ delay = 0 }: { delay?: number }) {
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: delay }),
        withTiming(2.2, { duration: 1800 }),
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: delay }),
        withTiming(0, { duration: 1800 }),
      ),
      -1,
      false
    );
  }, [delay]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.radarRing, style]}
      pointerEvents="none"
    />
  );
}

function PeerCard({ peer, onConnect }: { peer: BLEPeer; onConnect: (p: BLEPeer) => void }) {
  return (
    <GlassPanel style={styles.peerCard} radius={BorderRadius.xl}>
      <Pressable
        style={styles.peerInner}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onConnect(peer);
        }}
      >
        <View style={[styles.peerAvatar, { backgroundColor: Colors.accent.subtle }]}>
          <NeonText preset="headingSmall" color={Colors.accent.DEFAULT}>
            {peer.name[0]?.toUpperCase() ?? '?'}
          </NeonText>
        </View>
        <View style={styles.peerInfo}>
          <NeonText preset="bodyMedium">{peer.name}</NeonText>
          <NeonText preset="caption" color={Colors.text.muted}>
            {peer.rssi !== 0 ? `Signal: ${peer.rssi} dBm` : 'Tap to connect'}
          </NeonText>
        </View>
        <NeonText preset="bodySmall" color={Colors.primary.DEFAULT}>
          Connect →
        </NeonText>
      </Pressable>
    </GlassPanel>
  );
}

export function BluetoothLobbyScreen() {
  const navigation = useNavigation<Nav>();
  const [mode, setMode] = React.useState<Mode>('choose');
  const {
    bleState,
    peers,
    error,
    startHosting,
    startScanning,
    connectToPeer,
    disconnect,
  } = useBluetooth();

  const handleBack = () => {
    disconnect();
    if (mode === 'choose') {
      navigation.goBack();
    } else {
      setMode('choose');
    }
  };

  const handleHost = async () => {
    setMode('host');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await startHosting();
  };

  const handleScan = async () => {
    setMode('scan');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await startScanning();
  };

  const stateLabel: Record<string, string> = {
    idle: '',
    'requesting-permission': 'Requesting Bluetooth permission...',
    advertising: 'Waiting for opponent to connect...',
    scanning: 'Searching for nearby games...',
    connecting: 'Connecting...',
    connected: 'Connected!',
    error: error ?? 'Bluetooth error',
  };

  const isSearching = bleState === 'advertising' || bleState === 'scanning';

  return (
    <ScreenBase>
      <View style={styles.header}>
        <BackButton onPress={handleBack} />
        <NeonText preset="headingLarge" glow="accent" style={styles.title}>
          Bluetooth Duel
        </NeonText>
        <View style={styles.spacer} />
      </View>

      {mode === 'choose' && (
        <View style={styles.choose}>
          <NeonText preset="bodyMedium" color={Colors.text.secondary} style={styles.chooseDesc}>
            Play locally with a friend — no internet required.
          </NeonText>

          <GlassPanel style={styles.chooseCard} radius={BorderRadius['3xl']}>
            <View style={styles.chooseInner}>
              <NeonButton
                label="Host Game"
                variant="accent"
                size="lg"
                fullWidth
                onPress={handleHost}
              />
              <NeonText preset="caption" color={Colors.text.muted} style={styles.orLabel}>
                — or —
              </NeonText>
              <NeonButton
                label="Find Game"
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleScan}
              />
            </View>
          </GlassPanel>

          <GlassPanel style={styles.infoCard} radius={BorderRadius.xl}>
            <View style={styles.infoInner}>
              <NeonText preset="label" color={Colors.text.muted}>
                How it works
              </NeonText>
              <NeonText preset="bodySmall" color={Colors.text.secondary}>
                One player hosts, the other scans. Both devices must have Bluetooth on and be within ~10m of each other.
              </NeonText>
            </View>
          </GlassPanel>
        </View>
      )}

      {mode === 'host' && (
        <View style={styles.radarSection}>
          {/* Radar animation */}
          <View style={styles.radar}>
            {isSearching && (
              <>
                <RadarRing delay={0} />
                <RadarRing delay={600} />
                <RadarRing delay={1200} />
              </>
            )}
            <View style={styles.radarCenter}>
              <NeonText style={styles.radarIcon}>◈</NeonText>
            </View>
          </View>

          <NeonText preset="headingSmall" glow="accent" color={Colors.accent.DEFAULT}>
            {stateLabel[bleState] ?? 'Hosting...'}
          </NeonText>
          <NeonText preset="bodySmall" color={Colors.text.muted}>
            Your device name: {require('react-native').Platform.select({ ios: 'iPhone', android: 'Android' })}
          </NeonText>
          <NeonButton
            label="Cancel"
            variant="ghost"
            size="md"
            style={styles.cancelBtn}
            onPress={handleBack}
          />
        </View>
      )}

      {mode === 'scan' && (
        <View style={styles.scanSection}>
          <View style={styles.radar}>
            {isSearching && (
              <>
                <RadarRing delay={0} />
                <RadarRing delay={600} />
                <RadarRing delay={1200} />
              </>
            )}
            <View style={styles.radarCenter}>
              <NeonText style={styles.radarIcon}>⬡</NeonText>
            </View>
          </View>

          <NeonText preset="headingSmall" glow="primary" color={Colors.primary.DEFAULT}>
            {stateLabel[bleState] ?? 'Scanning...'}
          </NeonText>

          {peers.length > 0 && (
            <>
              <NeonText preset="label" color={Colors.text.muted} style={styles.peersLabel}>
                Nearby Games
              </NeonText>
              <FlatList
                data={peers}
                keyExtractor={(p) => p.deviceId}
                style={styles.peersList}
                contentContainerStyle={styles.peersContent}
                renderItem={({ item }) => (
                  <PeerCard peer={item} onConnect={connectToPeer} />
                )}
              />
            </>
          )}

          {peers.length === 0 && isSearching && (
            <NeonText preset="bodySmall" color={Colors.text.muted} style={styles.nopeers}>
              No games found yet — make sure a friend is hosting nearby
            </NeonText>
          )}

          <NeonButton
            label="Cancel"
            variant="ghost"
            size="md"
            style={styles.cancelBtn}
            onPress={handleBack}
          />
        </View>
      )}
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

  // Choose mode
  choose: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    justifyContent: 'center',
    gap: Spacing[6],
  },
  chooseDesc: { textAlign: 'center' },
  chooseCard: { flex: 0 },
  chooseInner: {
    padding: Spacing[8],
    gap: Spacing[4],
    alignItems: 'center',
  },
  orLabel: { textAlign: 'center' },
  infoCard: { flex: 0 },
  infoInner: {
    padding: Spacing[5],
    gap: Spacing[2],
  },

  // Radar
  radarSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[5],
    paddingHorizontal: Spacing[6],
  },
  scanSection: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing[4],
    gap: Spacing[5],
    paddingHorizontal: Spacing[6],
  },
  radar: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.accent.DEFAULT,
  },
  radarCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent.subtle,
    borderWidth: 2,
    borderColor: Colors.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  radarIcon: {
    fontSize: 26,
    lineHeight: 32,
    color: Colors.accent.DEFAULT,
  },
  cancelBtn: { marginTop: Spacing[4] },

  // Peers
  peersLabel: { alignSelf: 'flex-start' },
  peersList: { width: '100%', maxHeight: 300 },
  peersContent: { gap: Spacing[3] },
  peerCard: { flex: 0, width: '100%' },
  peerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    gap: Spacing[3],
  },
  peerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.accent.DEFAULT,
  },
  peerInfo: { flex: 1 },
  nopeers: { textAlign: 'center', paddingHorizontal: Spacing[8] },
});
