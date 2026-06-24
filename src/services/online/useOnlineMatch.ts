import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import type { MatchStatus, GameState, TurnAction } from '@/types/game';
import { socketService } from './SocketService';
import { useGameStore } from '@/store/gameStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface OnlineMatchState {
  status: MatchStatus;
  matchId: string | null;
  opponentName: string | null;
  opponentElo: number | null;
  error: string | null;
}

export function useOnlineMatch(playerId: string, displayName: string, elo: number = 1000) {
  const navigation = useNavigation<Nav>();
  const [state, setState] = useState<OnlineMatchState>({
    status: 'searching',
    matchId: null,
    opponentName: null,
    opponentElo: null,
    error: null,
  });

  const gameStore = useGameStore;
  const matchIdRef = useRef<string | null>(null);

  const joinQueue = useCallback(() => {
    const socket = socketService.connect();
    setState((s) => ({ ...s, status: 'searching', error: null }));
    socketService.emit('match:join', { playerId, displayName, elo });
  }, [playerId, displayName, elo]);

  const leaveQueue = useCallback(() => {
    if (matchIdRef.current) {
      socketService.emit('match:leave', matchIdRef.current);
    }
    socketService.disconnect();
    setState({
      status: 'idle' as MatchStatus,
      matchId: null,
      opponentName: null,
      opponentElo: null,
      error: null,
    });
  }, []);

  const sendAction = useCallback((action: TurnAction) => {
    if (!matchIdRef.current) return;
    socketService.emit('game:action', { matchId: matchIdRef.current, action });
  }, []);

  useEffect(() => {
    const offFound = socketService.on('match:found', ({ matchId, opponentName, opponentElo }) => {
      matchIdRef.current = matchId;
      setState((s) => ({
        ...s,
        status: 'found',
        matchId,
        opponentName,
        opponentElo,
      }));
      // Signal ready
      socketService.emit('match:ready', matchId);
    });

    const offStart = socketService.on('match:start', (initialState: GameState) => {
      setState((s) => ({ ...s, status: 'active' }));
      navigation.navigate('Game', { mode: 'online', matchId: matchIdRef.current ?? undefined });
    });

    const offAction = socketService.on('game:actionBroadcast', (action: TurnAction) => {
      const store = gameStore.getState();
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
    });

    const offSync = socketService.on('game:stateSync', (syncedState: GameState) => {
      // Full state reconcile — overwrite local game
      useGameStore.setState({ game: syncedState });
    });

    const offLeft = socketService.on('match:opponentLeft', () => {
      setState((s) => ({ ...s, status: 'error', error: 'Opponent disconnected' }));
    });

    const offError = socketService.on('error', (message: string) => {
      setState((s) => ({ ...s, error: message }));
    });

    const offOver = socketService.on('game:over', ({ winnerId }) => {
      setState((s) => ({ ...s, status: 'finished' }));
    });

    return () => {
      offFound();
      offStart();
      offAction();
      offSync();
      offLeft();
      offError();
      offOver();
    };
  }, [navigation]);

  return { state, joinQueue, leaveQueue, sendAction };
}
