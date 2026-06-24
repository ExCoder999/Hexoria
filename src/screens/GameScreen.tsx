import React, { useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenBase, ResourceBar, NeonButton } from '@/components/ui';
import { HexGrid, TurnBanner, TerritoryBar, HandTray } from '@/components/game';
import { Colors, Spacing } from '@/theme';
import type { RootStackParamList } from '@/types/navigation';
import type { HexTile } from '@/types/game';
import { hexKey } from '@/utils/hexMath';
import { useGameStore } from '@/store/gameStore';

type Route = RouteProp<RootStackParamList, 'Game'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'Game'>;

const PLAYER_COLORS: Record<string, string> = {
  player1: Colors.player.one,
  player2: Colors.player.two,
  player3: Colors.player.three,
  player4: Colors.player.four,
};

export function GameScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { width, height } = useWindowDimensions();

  const {
    game,
    ui,
    startGame,
    selectTile,
    expandTerritory,
    playCard,
    endTurn,
    currentPlayer,
  } = useGameStore();

  // Initialize game on mount
  useEffect(() => {
    startGame(
      {
        mode: route.params.mode,
        playerCount: 2,
        boardSize: 'medium',
        aiDifficulty: route.params.difficulty ?? 'medium',
        winCondition: 'territory',
        victoryThreshold: 60,
        fogOfWar: false,
      },
      ['You', 'Opponent']
    );
  }, []);

  // Navigate to game over when winner decided
  useEffect(() => {
    if (game?.winnerId) {
      navigation.replace('GameOver', {
        winnerId: game.players[game.winnerId]?.name ?? game.winnerId,
        playerIds: game.playerOrder,
        mode: route.params.mode,
      });
    }
  }, [game?.winnerId]);

  const tiles = useMemo(() => Object.values(game?.board ?? {}), [game?.board]);
  const totalTiles = useMemo(
    () => tiles.filter((t) => t.terrain !== 'water').length,
    [tiles]
  );

  const handleTilePress = useCallback(
    (tile: HexTile) => {
      if (!game) return;
      const key = hexKey(tile.coord);
      const currentPid = game.currentPlayerId;

      // Move selected unit to reachable tile
      if (ui.selectedTileKey && ui.reachableKeys.has(key)) {
        // Import moveUnit from store inline
        useGameStore.getState().moveUnit(ui.selectedTileKey, key);
        return;
      }

      // Attack enemy unit
      if (ui.selectedTileKey && ui.attackableKeys.has(key)) {
        useGameStore.getState().attackUnit(ui.selectedTileKey, key);
        return;
      }

      // Select own tile or expand territory
      if (tile.ownerId === currentPid || tile.unitId) {
        selectTile(key);
      } else {
        expandTerritory(key);
      }
    },
    [game, ui, selectTile, expandTerritory]
  );

  const player = currentPlayer();

  if (!game || !player) {
    return (
      <ScreenBase>
        <View style={styles.loading} />
      </ScreenBase>
    );
  }

  return (
    <ScreenBase edges={[]} withGradient={false}>
      {/* HUD */}
      <View style={styles.hud}>
        <ResourceBar resources={player.resources} />
        <NeonButton label="End Turn" variant="primary" size="sm" onPress={endTurn} />
      </View>

      {/* Hex Grid */}
      <HexGrid
        tiles={tiles}
        selectedKey={ui.selectedTileKey}
        highlightedKeys={new Set()}
        reachableKeys={ui.reachableKeys}
        playerColors={PLAYER_COLORS}
        onTilePress={handleTilePress}
        canvasWidth={width}
        canvasHeight={height}
        hexSize={36}
      />

      {/* Territory bar */}
      <View style={styles.footer}>
        <TerritoryBar
          players={Object.values(game.players)}
          playerColors={PLAYER_COLORS}
          totalTiles={totalTiles}
          victoryThreshold={game.settings.victoryThreshold}
        />
      </View>

      {/* Hand tray (slides up from bottom) */}
      <HandTray
        hand={player.hand}
        resources={player.resources}
        onPlayCard={(id) => playCard(id)}
      />

      {/* Turn banner */}
      <TurnBanner
        playerName={player.name}
        turn={game.currentTurn}
        playerColor={PLAYER_COLORS[game.currentPlayerId] ?? Colors.primary.DEFAULT}
        visible={ui.showBanner}
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
    bottom: 220,
    left: Spacing[4],
    right: Spacing[4],
    zIndex: 50,
  },
  loading: {
    flex: 1,
  },
});
