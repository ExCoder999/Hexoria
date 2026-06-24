import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { ScreenBase, ResourceBar, NeonButton } from '@/components/ui';
import { HexGrid, TurnBanner, TerritoryBar } from '@/components/game';
import { Colors, Spacing } from '@/theme';
import type { RootStackParamList } from '@/types/navigation';
import type { HexTile, Player } from '@/types/game';
import {
  hexKey,
  generateBoardCoords,
  hexBFS,
} from '@/utils/hexMath';
import { randomTerrain } from '@/utils/terrain';

type Route = RouteProp<RootStackParamList, 'Game'>;

const PLAYER_COLORS: Record<string, string> = {
  player1: Colors.player.one,
  player2: Colors.player.two,
};

function buildInitialBoard(size: 'small' | 'medium' | 'large'): Record<string, HexTile> {
  const coords = generateBoardCoords(size);
  const board: Record<string, HexTile> = {};
  coords.forEach((coord, i) => {
    const key = hexKey(coord);
    board[key] = {
      coord,
      terrain: randomTerrain(i * 7 + coord.q * 13 + coord.r * 31),
      ownerId: null,
      unitId: null,
      structureId: null,
      revealed: true,
    };
  });
  return board;
}

function buildInitialPlayers(): Record<string, Player> {
  return {
    player1: {
      id: 'player1',
      name: 'You',
      avatarKey: 'avatar1',
      isHuman: true,
      resources: { gold: 10, mana: 5, ore: 3 },
      hand: [],
      deck: [],
      discardPile: [],
      territoryCount: 0,
      totalTerritories: 0,
    },
    player2: {
      id: 'player2',
      name: 'Opponent',
      avatarKey: 'avatar2',
      isHuman: false,
      resources: { gold: 10, mana: 5, ore: 3 },
      hand: [],
      deck: [],
      discardPile: [],
      territoryCount: 0,
      totalTerritories: 0,
    },
  };
}

export function GameScreen() {
  const route = useRoute<Route>();
  const { width, height } = useWindowDimensions();

  const [board, setBoard] = useState<Record<string, HexTile>>(() =>
    buildInitialBoard('medium')
  );
  const [players, setPlayers] = useState<Record<string, Player>>(buildInitialPlayers);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [reachableKeys, setReachableKeys] = useState<Set<string>>(new Set());
  const [currentPlayerId, setCurrentPlayerId] = useState('player1');
  const [turn, setTurn] = useState(1);
  const [showBanner, setShowBanner] = useState(true);

  const tiles = useMemo(() => Object.values(board), [board]);
  const totalTiles = tiles.filter((t) => t.terrain !== 'water').length;

  useEffect(() => {
    setShowBanner(true);
    const t = setTimeout(() => setShowBanner(false), 2500);
    return () => clearTimeout(t);
  }, [currentPlayerId, turn]);

  const handleTilePress = useCallback(
    (tile: HexTile) => {
      const key = hexKey(tile.coord);

      if (selectedKey === key) {
        setSelectedKey(null);
        setReachableKeys(new Set());
        return;
      }

      // Select own unit to show movement range
      if (tile.ownerId === currentPlayerId && tile.unitId) {
        setSelectedKey(key);
        const reachable = hexBFS(tile.coord, 3, (c) => {
          const t = board[hexKey(c)];
          return t?.terrain !== 'water';
        });
        setReachableKeys(reachable);
        Haptics.selectionAsync();
        return;
      }

      // Expand territory to adjacent tile
      if (
        selectedKey === null &&
        (tile.ownerId === null || tile.ownerId !== currentPlayerId)
      ) {
        const neighbors = Object.values(board).filter(
          (t) => t.ownerId === currentPlayerId
        );
        const isAdjacent = neighbors.some((owned) => {
          const dist = Math.max(
            Math.abs(owned.coord.q - tile.coord.q),
            Math.abs(owned.coord.r - tile.coord.r),
            Math.abs(owned.coord.s - tile.coord.s)
          );
          return dist === 1;
        });

        const canExpand = isAdjacent || Object.values(board).every((t) => t.ownerId !== currentPlayerId);

        if (canExpand && tile.terrain !== 'water') {
          setBoard((prev) => ({
            ...prev,
            [key]: { ...tile, ownerId: currentPlayerId },
          }));
          setPlayers((prev) => ({
            ...prev,
            [currentPlayerId]: {
              ...prev[currentPlayerId],
              territoryCount: prev[currentPlayerId].territoryCount + 1,
            },
          }));
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }

      // Move unit if reachable
      if (selectedKey && reachableKeys.has(key) && tile.ownerId !== currentPlayerId) {
        const sourceTile = board[selectedKey];
        setBoard((prev) => ({
          ...prev,
          [selectedKey]: { ...sourceTile, unitId: null, ownerId: null },
          [key]: { ...tile, unitId: sourceTile.unitId, ownerId: currentPlayerId },
        }));
        setSelectedKey(null);
        setReachableKeys(new Set());
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      }

      setSelectedKey(key);
      setReachableKeys(new Set());
    },
    [board, selectedKey, reachableKeys, currentPlayerId]
  );

  const handleEndTurn = useCallback(() => {
    const nextPlayer = currentPlayerId === 'player1' ? 'player2' : 'player1';
    setCurrentPlayerId(nextPlayer);
    setSelectedKey(null);
    setReachableKeys(new Set());

    if (nextPlayer === 'player1') {
      setTurn((t) => t + 1);
      // Collect resources for both players
      setPlayers((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((pid) => {
          const p = updated[pid];
          const goldGain = p.territoryCount;
          updated[pid] = {
            ...p,
            resources: {
              gold: p.resources.gold + goldGain,
              mana: p.resources.mana + Math.floor(p.territoryCount / 3),
              ore: p.resources.ore + Math.floor(p.territoryCount / 5),
            },
          };
        });
        return updated;
      });
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, [currentPlayerId]);

  const currentPlayer = players[currentPlayerId];
  const highlightedKeys = new Set<string>();

  return (
    <ScreenBase edges={[]} withGradient={false}>
      {/* HUD top */}
      <View style={styles.hud}>
        <ResourceBar resources={currentPlayer?.resources ?? { gold: 0, mana: 0, ore: 0 }} />
        <NeonButton
          label="End Turn"
          variant="primary"
          size="sm"
          onPress={handleEndTurn}
        />
      </View>

      {/* Hex Grid */}
      <HexGrid
        tiles={tiles}
        selectedKey={selectedKey}
        highlightedKeys={highlightedKeys}
        reachableKeys={reachableKeys}
        playerColors={PLAYER_COLORS}
        onTilePress={handleTilePress}
        canvasWidth={width}
        canvasHeight={height - 120}
        hexSize={36}
      />

      {/* Territory bar */}
      <View style={styles.footer}>
        <TerritoryBar
          players={Object.values(players)}
          playerColors={PLAYER_COLORS}
          totalTiles={totalTiles}
          victoryThreshold={60}
        />
      </View>

      {/* Turn banner overlay */}
      <TurnBanner
        playerName={currentPlayer?.name ?? ''}
        turn={turn}
        playerColor={PLAYER_COLORS[currentPlayerId] ?? Colors.primary.DEFAULT}
        visible={showBanner}
      />
    </ScreenBase>
  );
}

const styles = StyleSheet.create({
  hud: {
    position: 'absolute',
    top: 60,
    left: Spacing[4],
    right: Spacing[4],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 50,
  },
  footer: {
    position: 'absolute',
    bottom: Spacing[8],
    left: Spacing[4],
    right: Spacing[4],
    zIndex: 50,
  },
});
