import type {
  GameState,
  HexTile,
  Player,
  AIDifficulty,
  TurnAction,
  Resources,
} from '@/types/game';
import {
  hexKey,
  hexNeighbors,
  hexDistance,
  hexBFS,
} from '@/utils/hexMath';
import { CARD_MAP } from '@/data/cards';

// ─── Action Descriptors ───────────────────────────────────────────────────────

type AIAction =
  | { type: 'expand'; tileKey: string; score: number }
  | { type: 'move'; fromKey: string; toKey: string; score: number }
  | { type: 'attack'; attackerKey: string; defenderKey: string; score: number }
  | { type: 'playCard'; instanceId: string; targetKey?: string; score: number }
  | { type: 'endTurn'; score: number };

// ─── Difficulty Config ────────────────────────────────────────────────────────

interface DifficultyConfig {
  errorRate: number;         // chance (0–1) to pick a random non-optimal action
  lookAheadDepth: number;
  expansionBias: number;     // weight multiplier for territory gain
  aggressionBias: number;    // weight multiplier for attacking enemy units
}

const DIFFICULTY_CONFIG: Record<AIDifficulty, DifficultyConfig> = {
  easy: { errorRate: 0.45, lookAheadDepth: 1, expansionBias: 1.0, aggressionBias: 0.5 },
  medium: { errorRate: 0.20, lookAheadDepth: 1, expansionBias: 1.3, aggressionBias: 0.9 },
  hard: { errorRate: 0.05, lookAheadDepth: 2, expansionBias: 1.6, aggressionBias: 1.3 },
  legend: { errorRate: 0.0, lookAheadDepth: 3, expansionBias: 2.0, aggressionBias: 1.8 },
};

// ─── AI Engine ────────────────────────────────────────────────────────────────

export class AIEngine {
  private difficulty: AIDifficulty;
  private config: DifficultyConfig;
  private playerId: string;

  constructor(playerId: string, difficulty: AIDifficulty = 'medium') {
    this.playerId = playerId;
    this.difficulty = difficulty;
    this.config = DIFFICULTY_CONFIG[difficulty];
  }

  /**
   * Returns the sequence of actions the AI wants to take this turn.
   */
  computeTurn(game: GameState): AIAction[] {
    const actions: AIAction[] = [];
    const maxActions = 5; // cap actions per turn to avoid runaway AI

    for (let i = 0; i < maxActions; i++) {
      const action = this.pickBestAction(game, actions);
      if (!action || action.type === 'endTurn') break;
      actions.push(action);
    }

    actions.push({ type: 'endTurn', score: 0 });
    return actions;
  }

  private pickBestAction(game: GameState, alreadyPicked: AIAction[]): AIAction | null {
    const candidates = this.generateCandidates(game, alreadyPicked);
    if (candidates.length === 0) return null;

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);

    // Error injection: occasionally pick a suboptimal move
    if (Math.random() < this.config.errorRate && candidates.length > 1) {
      const randomIdx = 1 + Math.floor(Math.random() * (candidates.length - 1));
      return candidates[randomIdx];
    }

    return candidates[0];
  }

  private generateCandidates(game: GameState, alreadyPicked: AIAction[]): AIAction[] {
    const candidates: AIAction[] = [];
    const pid = this.playerId;
    const player = game.players[pid];
    if (!player) return candidates;

    const board = game.board;
    const ownedTiles = Object.values(board).filter((t) => t.ownerId === pid);
    const totalPassable = Object.values(board).filter((t) => t.terrain !== 'water').length;

    // ── Expansion moves ──
    const expandable = this.getExpandableTiles(board, ownedTiles, pid);
    expandable.forEach((tile) => {
      // Prioritize capturing tiles adjacent to enemy territory
      const enemyNeighborCount = hexNeighbors(tile.coord).filter((n) => {
        const t = board[hexKey(n)];
        return t?.ownerId && t.ownerId !== pid;
      }).length;

      const resourceScore =
        (tile.terrain === 'desert' ? 2 : 0) +
        (tile.terrain === 'mountain' ? 1.5 : 0) +
        (tile.terrain === 'forest' ? 1 : 0) +
        (tile.terrain === 'plains' ? 0.5 : 0);

      const score =
        (10 + enemyNeighborCount * 3 + resourceScore) * this.config.expansionBias;
      candidates.push({ type: 'expand', tileKey: hexKey(tile.coord), score });
    });

    // ── Unit movement ──
    Object.values(game.units).forEach((unit) => {
      if (unit.ownerId !== pid || unit.movesRemaining <= 0) return;
      const fromKey = hexKey(unit.coord);

      const reachable = hexBFS(unit.coord, unit.movesRemaining, (c) => {
        const t = board[hexKey(c)];
        return t?.terrain !== 'water';
      });

      // Move toward nearest enemy territory centroid
      const enemyTiles = Object.values(board).filter(
        (t) => t.ownerId && t.ownerId !== pid
      );
      const nearestEnemy = enemyTiles.reduce<HexTile | null>((best, t) => {
        if (!best) return t;
        return hexDistance(unit.coord, t.coord) < hexDistance(unit.coord, best.coord) ? t : best;
      }, null);

      reachable.forEach((key) => {
        const targetCoord = game.board[key]?.coord;
        if (!targetCoord) return;
        const distGain = nearestEnemy
          ? hexDistance(unit.coord, nearestEnemy.coord) -
            hexDistance(targetCoord, nearestEnemy.coord)
          : 0;
        candidates.push({
          type: 'move',
          fromKey,
          toKey: key,
          score: (5 + distGain * 2) * this.config.aggressionBias,
        });
      });
    });

    // ── Attack moves ──
    Object.values(game.units).forEach((unit) => {
      if (unit.ownerId !== pid || unit.hasAttacked) return;
      const fromKey = hexKey(unit.coord);

      hexNeighbors(unit.coord).forEach((n) => {
        const nKey = hexKey(n);
        const nTile = board[nKey];
        if (!nTile?.unitId || nTile.ownerId === pid) return;

        const defender = game.units[nTile.unitId];
        if (!defender) return;

        const attackDmg = Math.max(1, unit.attack - defender.defense);
        const counterDmg = Math.max(1, defender.attack - unit.defense);
        const willKill = attackDmg >= defender.currentHp;
        const willSurvive = unit.currentHp - counterDmg > 0;

        let score = (attackDmg * 2) * this.config.aggressionBias;
        if (willKill) score += 15 * this.config.aggressionBias;
        if (!willSurvive) score -= 20;

        candidates.push({
          type: 'attack',
          attackerKey: fromKey,
          defenderKey: nKey,
          score,
        });
      });
    });

    // ── Play cards ──
    player.hand.forEach((cardInst) => {
      const def = CARD_MAP[cardInst.definitionId];
      if (!def) return;
      if (
        player.resources.gold < def.cost.gold ||
        player.resources.mana < def.cost.mana ||
        player.resources.ore < def.cost.ore
      ) {
        return;
      }

      // Simple scoring based on card type and rarity
      const rarityBonus: Record<string, number> = {
        common: 1,
        uncommon: 2,
        rare: 4,
        legendary: 8,
      };
      const score = 6 + (rarityBonus[def.rarity] ?? 1);
      candidates.push({ type: 'playCard', instanceId: cardInst.instanceId, score });
    });

    return candidates;
  }

  private getExpandableTiles(
    board: Record<string, HexTile>,
    ownedTiles: HexTile[],
    pid: string
  ): HexTile[] {
    const result: HexTile[] = [];
    const seen = new Set<string>();

    if (ownedTiles.length === 0) {
      // First move: pick a tile on the opposite side from player1
      const allPassable = Object.values(board).filter(
        (t) => t.terrain !== 'water' && !t.ownerId
      );
      // Prefer high negative q (opposite to player1 which starts at positive q)
      const best = allPassable.sort((a, b) => a.coord.q - b.coord.q)[0];
      if (best) result.push(best);
      return result;
    }

    ownedTiles.forEach((owned) => {
      hexNeighbors(owned.coord).forEach((n) => {
        const key = hexKey(n);
        if (seen.has(key)) return;
        seen.add(key);
        const tile = board[key];
        if (tile && tile.terrain !== 'water' && tile.ownerId !== pid) {
          result.push(tile);
        }
      });
    });

    return result;
  }
}
