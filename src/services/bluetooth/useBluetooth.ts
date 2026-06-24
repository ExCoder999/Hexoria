import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import type { BLEPeer, TurnAction } from '@/types/game';
import type { BLEState, BLERole } from './BLEService';
import { bleService } from './BLEService';
import { useGameStore } from '@/store/gameStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function useBluetooth() {
  const navigation = useNavigation<Nav>();
  const [bleState, setBleState] = useState<BLEState>('idle');
  const [peers, setPeers] = useState<BLEPeer[]>([]);
  const [connectedPeer, setConnectedPeer] = useState<BLEPeer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bleService.setHandlers({
      onState: (s) => {
        setBleState(s);
        if (s === 'error') setError('Bluetooth error occurred');
      },
      onPeer: (deviceId, name) => {
        setPeers((prev) => {
          if (prev.some((p) => p.deviceId === deviceId)) return prev;
          return [...prev, { deviceId, name, rssi: 0 }];
        });
      },
      onAction: (action: TurnAction) => {
        // Apply incoming opponent action to local game store
        const store = useGameStore.getState();
        switch (action.type) {
          case 'move':
            store.expandTerritory(action.payload.tileKey as string);
            break;
          case 'endTurn':
            store.endTurn();
            break;
          default:
            break;
        }
      },
    });

    return () => {
      bleService.disconnect();
    };
  }, []);

  const startHosting = useCallback(async () => {
    setError(null);
    setPeers([]);
    await bleService.startAdvertising();
  }, []);

  const startScanning = useCallback(async () => {
    setError(null);
    setPeers([]);
    await bleService.startScanning();
  }, []);

  const connectToPeer = useCallback(async (peer: BLEPeer) => {
    setConnectedPeer(peer);
    await bleService.connectToHost(peer.deviceId);
    if (bleService.isConnected) {
      // Start game as guest (player2)
      useGameStore.getState().startGame(
        {
          mode: 'bluetooth',
          playerCount: 2,
          boardSize: 'medium',
          winCondition: 'territory',
          victoryThreshold: 60,
          fogOfWar: false,
        },
        ['You', peer.name]
      );
      navigation.navigate('Game', { mode: 'bluetooth' });
    }
  }, [navigation]);

  const sendAction = useCallback((action: TurnAction) => {
    bleService.sendAction(action);
  }, []);

  const disconnect = useCallback(() => {
    bleService.disconnect();
    setConnectedPeer(null);
    setPeers([]);
  }, []);

  return {
    bleState,
    peers,
    connectedPeer,
    error,
    startHosting,
    startScanning,
    connectToPeer,
    sendAction,
    disconnect,
    isHost: bleService.currentRole === 'host',
  };
}
