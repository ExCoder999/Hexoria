import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  GameState,
  GameSettings,
  HexTile,
  UnitInstance,
  Player,
  CardInstance,
  Resources,
  TurnAction,
} from '@/types/game';
import {
  hexKey,
  hexNeighbors,
  hexDistance,
  generateBoardCoords,
  hexBFS,
} from '@/utils/hexMath';
import { randomTerrain } from '@/utils/terrain';
import { CARD_MAP, STARTER_DECK_IDS } from '@/data/cards';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(playerId: string, cardIds: string[]): CardInstance[] {
  return cardIds
    .filter((id) => CARD_MAP[id])
    .map((id, i) => ({ instanceId: `${playerId}_card_${i}`, definitionId: id, ownerId: playerId }));
}

function buildBoard(settings: GameSettings): Record<string, HexTile> {
  const coords = generateBoardCoords(settings.boardSize);
  const board: Record<string, HexTile> = {};
  coords.forEach((coord, i) => {
    const key = hexKey(coord);
    board[key] = {
      coord,
      terrain: randomTerrain(i * 11 + coord.q * 17 + coord.r * 37),
      ownerId: null,
      unitId: null,
      structureId: null,
      revealed: !settings.fogOfWar,
    };
  });
  return board;
}

function buildPlayer(id: string, name: string, isHuman: boolean): Player {
  const deck = shuffle(buildDeck(id, STARTER_DECK_IDS), Date.now() + id.charCodeAt(0));
  const hand = deck.splice(0, 4);
  return {
    id,
    name,
    avatarKey: 'avatar1',
    isHuman,
    resources: { gold: 10, mana: 5, ore: 3 },
    hand,
    deck,
    discardPile: [],
    territoryCount: 0,
    totalTerritories: 0,
  };
}

function collectResources(
  board: Record<string, HexTile>,
  playerId: string,
  current: Resources
): Resources {
  const result = { ...current };
  Object.values(board).forEach((tile) => {
    if (tile.ownerId !== playerId) return;
    const terrain = randomTerrain(0); // replaced by terrain data lookup
    // Resource gain is simple: 1 gold per tile, 1 mana per 3 tiles
    result.gold += 1;
  });
  result.mana += Math.floor(
    Object.values(board).filter((t) => t.ownerId === playerId).length / 3
  );
  result.ore += Math.floor(
    Object.values(board).filter(
      (t) => t.ownerId === playerId && t.terrain === 'mountain'
    ).length
  );
  return result;
}

// ─── Store Types ─────────────────────────────────────────────────────────────

interface UIState {
  selectedTileKey: string | null;
  reachableKeys: Set<string>;
  attackableKeys: Set<string>;
  showBanner: boolean;
}

interface GameStore {
  game: GameState | null;
  ui: UIState;

  // Game lifecycle
  startGame: (settings: GameSettings, playerNames: string[]) => void;
  resetGame: () => void;

  // Actions
  selectTile: (key: string) => void;
  clearSelection: () => void;
  expandTerritory: (key: string) => void;
  moveUnit: (fromKey: string, toKey: string) => void;
  attackUnit: (attackerKey: string, defenderKey: string) => void;
  playCard: (instanceId: string, targetKey?: string) => void;
  endTurn: () => void;

  // Derived helpers
  currentPlayer: () => Player | null;
  isCurrentPlayer: (id: string) => boolean;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    game: null,
    ui: {
      selectedTileKey: null,
      reachableKeys: new Set(),
      attackableKeys: new Set(),
      showBanner: false,
    },

    startGame(settings, playerNames) {
      const playerOrder = playerNames.map((_, i) => `player${i + 1}`);
      const players: Record<string, Player> = {};
      playerOrder.forEach((pid, i) => {
        players[pid] = buildPlayer(pid, playerNames[i], i === 0);
      });

      const board = buildBoard(settings);

      set((s) => {
        s.game = {
          id: `game_${Date.now()}`,
          settings,
          phase: 'expansion',
          currentTurn: 1,
          currentPlayerId: playerOrder[0],
          players,
          playerOrder,
          board,
          units: {},
          structures: {},
          actionLog: [],
          winnerId: null,
          startedAt: Date.now(),
          updatedAt: Date.now(),
        };
        s.ui.showBanner = true;
      });
    },

    resetGame() {
      set((s) => {
        s.game = null;
        s.ui = {
          selectedTileKey: null,
          reachableKeys: new Set(),
          attackableKeys: new Set(),
          showBanner: false,
        };
      });
    },

    selectTile(key) {
      const g = get().game;
      if (!g) return;
      const tile = g.board[key];
      if (!tile) return;

      const currentPid = g.currentPlayerId;

      set((s) => {
        // Deselect if same tile
        if (s.ui.selectedTileKey === key) {
          s.ui.selectedTileKey = null;
          s.ui.reachableKeys = new Set();
          s.ui.attackableKeys = new Set();
          return;
        }

        s.ui.selectedTileKey = key;

        // Compute movement range if owned unit on tile
        if (tile.ownerId === currentPid && tile.unitId) {
          const unit = g.units[tile.unitId];
          if (unit && unit.movesRemaining > 0) {
            const reachable = hexBFS(tile.coord, unit.movesRemaining, (c) => {
              const t = g.board[hexKey(c)];
              return t?.terrain !== 'water';
            });
            s.ui.reachableKeys = reachable;
          }

          // Compute attackable neighbors
          const attackable = new Set<string>();
          hexNeighbors(tile.coord).forEach((n) => {
            const nKey = hexKey(n);
            const nTile = g.board[nKey];
            if (nTile?.ownerId && nTile.ownerId !== currentPid && nTile.unitId) {
              attackable.add(nKey);
            }
          });
          s.ui.attackableKeys = attackable;
        } else {
          s.ui.reachableKeys = new Set();
          s.ui.attackableKeys = new Set();
        }
      });
    },

    clearSelection() {
      set((s) => {
        s.ui.selectedTileKey = null;
        s.ui.reachableKeys = new Set();
        s.ui.attackableKeys = new Set();
      });
    },

    expandTerritory(key) {
      const g = get().game;
      if (!g) return;
      const tile = g.board[key];
      if (!tile || tile.terrain === 'water' || tile.ownerId === g.currentPlayerId) return;

      const currentPid = g.currentPlayerId;
      const ownedTiles = Object.values(g.board).filter((t) => t.ownerId === currentPid);

      // First tile or adjacent to owned
      const canExpand =
        ownedTiles.length === 0 ||
        ownedTiles.some((t) => hexDistance(t.coord, tile.coord) === 1);

      if (!canExpand) return;

      set((s) => {
        if (!s.game) return;
        s.game.board[key].ownerId = currentPid;
        s.game.players[currentPid].territoryCount += 1;
        s.game.updatedAt = Date.now();

        const action: TurnAction = {
          type: 'move',
          playerId: currentPid,
          payload: { tileKey: key },
          timestamp: Date.now(),
        };
        s.game.actionLog.push(action);
      });

      // Check win condition
      const updated = get().game!;
      const totalPassable = Object.values(updated.board).filter(
        (t) => t.terrain !== 'water'
      ).length;
      const threshold = updated.settings.victoryThreshold / 100;
      const winner = updated.playerOrder.find(
        (pid) => (updated.players[pid].territoryCount / totalPassable) >= threshold
      );
      if (winner) {
        set((s) => {
          if (!s.game) return;
          s.game.winnerId = winner;
          s.game.phase = 'game-over';
        });
      }
    },

    moveUnit(fromKey, toKey) {
      const g = get().game;
      if (!g) return;
      const fromTile = g.board[fromKey];
      const toTile = g.board[toKey];
      if (!fromTile?.unitId || !toTile) return;

      const unit = g.units[fromTile.unitId];
      if (!unit || unit.movesRemaining <= 0) return;

      set((s) => {
        if (!s.game) return;
        const unitId = s.game.board[fromKey].unitId!;
        s.game.board[fromKey].unitId = null;
        s.game.board[toKey].unitId = unitId;
        s.game.board[toKey].ownerId = s.game.currentPlayerId;
        s.game.units[unitId].coord = toTile.coord;
        s.game.units[unitId].movesRemaining -= 1;
        s.ui.selectedTileKey = null;
        s.ui.reachableKeys = new Set();
        s.ui.attackableKeys = new Set();
        s.game.updatedAt = Date.now();
      });
    },

    attackUnit(attackerKey, defenderKey) {
      const g = get().game;
      if (!g) return;
      const attTile = g.board[attackerKey];
      const defTile = g.board[defenderKey];
      if (!attTile?.unitId || !defTile?.unitId) return;

      const attacker = g.units[attTile.unitId];
      const defender = g.units[defTile.unitId];
      if (!attacker || !defender || attacker.hasAttacked) return;

      const attackDmg = Math.max(1, attacker.attack - defender.defense);
      const counterDmg = Math.max(1, defender.attack - attacker.defense);

      set((s) => {
        if (!s.game) return;
        const att = s.game.units[attacker.id];
        const def = s.game.units[defender.id];

        def.currentHp -= attackDmg;
        att.currentHp -= counterDmg;
        att.hasAttacked = true;

        if (def.currentHp <= 0) {
          delete s.game.units[defender.id];
          s.game.board[defenderKey].unitId = null;
          s.game.board[defenderKey].ownerId = s.game.currentPlayerId;
        }
        if (att.currentHp <= 0) {
          delete s.game.units[attacker.id];
          s.game.board[attackerKey].unitId = null;
        }

        s.ui.selectedTileKey = null;
        s.ui.reachableKeys = new Set();
        s.ui.attackableKeys = new Set();
        s.game.updatedAt = Date.now();
      });
    },

    playCard(instanceId, targetKey) {
      const g = get().game;
      if (!g) return;
      const currentPid = g.currentPlayerId;
      const player = g.players[currentPid];
      const cardInst = player.hand.find((c) => c.instanceId === instanceId);
      if (!cardInst) return;

      const def = CARD_MAP[cardInst.definitionId];
      if (!def) return;

      // Validate cost
      if (
        player.resources.gold < def.cost.gold ||
        player.resources.mana < def.cost.mana ||
        player.resources.ore < def.cost.ore
      ) {
        return;
      }

      set((s) => {
        if (!s.game) return;
        const p = s.game.players[currentPid];

        // Deduct cost
        p.resources.gold -= def.cost.gold;
        p.resources.mana -= def.cost.mana;
        p.resources.ore -= def.cost.ore;

        // Remove from hand
        p.hand = p.hand.filter((c) => c.instanceId !== instanceId);
        p.discardPile.push(cardInst);

        // Apply effect
        if (def.type === 'spell' && def.id === 'spell_gold_rush') {
          p.resources.gold += 4;
        }

        s.game.actionLog.push({
          type: 'playCard',
          playerId: currentPid,
          payload: { cardId: def.id, targetKey: targetKey ?? null },
          timestamp: Date.now(),
        });
        s.game.updatedAt = Date.now();
      });
    },

    endTurn() {
      const g = get().game;
      if (!g) return;
      const currentIdx = g.playerOrder.indexOf(g.currentPlayerId);
      const nextIdx = (currentIdx + 1) % g.playerOrder.length;
      const nextPid = g.playerOrder[nextIdx];
      const newTurn = nextIdx === 0 ? g.currentTurn + 1 : g.currentTurn;

      set((s) => {
        if (!s.game) return;

        // Collect resources for next player
        const nextPlayer = s.game.players[nextPid];
        nextPlayer.resources = collectResources(s.game.board, nextPid, nextPlayer.resources);

        // Draw a card
        if (nextPlayer.deck.length > 0) {
          const drawn = nextPlayer.deck.shift()!;
          if (nextPlayer.hand.length < 7) {
            nextPlayer.hand.push(drawn);
          }
        }

        // Reset unit actions
        Object.values(s.game.units).forEach((u) => {
          if (u.ownerId === nextPid) {
            u.movesRemaining = u.movement;
            u.hasAttacked = false;
          }
        });

        s.game.currentPlayerId = nextPid;
        s.game.currentTurn = newTurn;
        s.game.phase = 'expansion';
        s.game.updatedAt = Date.now();
        s.game.actionLog.push({
          type: 'endTurn',
          playerId: g.currentPlayerId,
          payload: {},
          timestamp: Date.now(),
        });

        s.ui.selectedTileKey = null;
        s.ui.reachableKeys = new Set();
        s.ui.attackableKeys = new Set();
        s.ui.showBanner = true;
      });
    },

    currentPlayer() {
      const g = get().game;
      if (!g) return null;
      return g.players[g.currentPlayerId] ?? null;
    },

    isCurrentPlayer(id) {
      return get().game?.currentPlayerId === id;
    },
  }))
);
