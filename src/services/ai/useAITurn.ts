import { useEffect, useRef, useCallback } from 'react';
import type { AIDifficulty } from '@/types/game';
import { useGameStore } from '@/store/gameStore';
import { AIEngine } from './AIEngine';

const AI_ACTION_DELAY_MS = 700;

export function useAITurn(aiPlayerId: string, difficulty: AIDifficulty = 'medium') {
  const engineRef = useRef<AIEngine>(new AIEngine(aiPlayerId, difficulty));
  const isRunningRef = useRef(false);

  const { game, expandTerritory, endTurn } = useGameStore();

  const runAITurn = useCallback(async (gameSnapshot: typeof game) => {
    if (!gameSnapshot || isRunningRef.current) return;
    if (gameSnapshot.currentPlayerId !== aiPlayerId) return;
    if (gameSnapshot.winnerId) return;

    isRunningRef.current = true;

    const actions = engineRef.current.computeTurn(gameSnapshot);
    const store = useGameStore.getState();

    for (const action of actions) {
      await new Promise<void>((res) => setTimeout(res, AI_ACTION_DELAY_MS));

      switch (action.type) {
        case 'expand':
          store.expandTerritory(action.tileKey);
          break;
        case 'move':
          store.moveUnit(action.fromKey, action.toKey);
          break;
        case 'attack':
          store.attackUnit(action.attackerKey, action.defenderKey);
          break;
        case 'playCard':
          store.playCard(action.instanceId, action.targetKey);
          break;
        case 'endTurn':
          store.endTurn();
          break;
      }

      // Abort if game ended during AI turn
      const current = useGameStore.getState().game;
      if (!current || current.winnerId) break;
    }

    isRunningRef.current = false;
  }, [aiPlayerId]);

  useEffect(() => {
    if (game?.currentPlayerId === aiPlayerId && !game.winnerId) {
      runAITurn(game);
    }
  }, [game?.currentPlayerId, game?.winnerId, runAITurn, aiPlayerId]);
}
