// ─── Coordinates ─────────────────────────────────────────────────────────────

/** Cube coordinate system for hex grids. Invariant: q + r + s === 0 */
export interface HexCoord {
  q: number;
  r: number;
  s: number;
}

// ─── Terrain ──────────────────────────────────────────────────────────────────

export type TerrainType = 'plains' | 'forest' | 'mountain' | 'water' | 'desert' | 'ruins';

export interface TerrainInfo {
  type: TerrainType;
  movementCost: number;    // turns of movement to enter
  defenseBonus: number;    // flat defense added to units
  goldPerTurn: number;
  manaPerTurn: number;
  orePerTurn: number;
  passable: boolean;
}

// ─── Hex Tile ─────────────────────────────────────────────────────────────────

export interface HexTile {
  coord: HexCoord;
  terrain: TerrainType;
  ownerId: string | null;
  unitId: string | null;
  structureId: string | null;
  revealed: boolean;       // for fog of war
}

// ─── Resources ───────────────────────────────────────────────────────────────

export interface Resources {
  gold: number;
  mana: number;
  ore: number;
}

// ─── Cards ───────────────────────────────────────────────────────────────────

export type CardType = 'unit' | 'spell' | 'structure' | 'tactic';
export type CardRarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type UnitClass = 'warrior' | 'archer' | 'mage' | 'cavalry' | 'siege' | 'beast';

export interface CardAbility {
  id: string;
  name: string;
  description: string;
  trigger: 'onPlay' | 'onDeath' | 'onAttack' | 'onDefend' | 'passive' | 'activated';
}

export interface CardDefinition {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  cost: Resources;
  description: string;
  flavorText?: string;
  artKey: string;         // asset key for card art

  // Unit-specific
  unitClass?: UnitClass;
  attack?: number;
  defense?: number;
  maxHp?: number;
  movement?: number;      // number of hexes per turn
  range?: number;         // 1 = melee, 2+ = ranged

  // Spell/tactic-specific
  targetType?: 'unit' | 'tile' | 'player' | 'global';

  abilities: CardAbility[];
}

export interface CardInstance {
  instanceId: string;
  definitionId: string;
  ownerId: string;
}

// ─── Units ───────────────────────────────────────────────────────────────────

export interface UnitInstance {
  id: string;
  definitionId: string;
  ownerId: string;
  coord: HexCoord;
  currentHp: number;
  maxHp: number;
  attack: number;
  defense: number;
  movement: number;
  movesRemaining: number;
  hasAttacked: boolean;
  statusEffects: StatusEffect[];
}

export type StatusEffectType = 'stunned' | 'poisoned' | 'fortified' | 'enraged' | 'frozen';

export interface StatusEffect {
  type: StatusEffectType;
  duration: number;        // turns remaining
  value?: number;
}

// ─── Structures ──────────────────────────────────────────────────────────────

export type StructureType = 'fortress' | 'tower' | 'mine' | 'shrine' | 'portal';

export interface StructureInstance {
  id: string;
  type: StructureType;
  ownerId: string;
  coord: HexCoord;
  level: number;
  hp: number;
  maxHp: number;
}

// ─── Player ──────────────────────────────────────────────────────────────────

export interface Player {
  id: string;
  name: string;
  avatarKey: string;
  isHuman: boolean;
  resources: Resources;
  hand: CardInstance[];
  deck: CardInstance[];
  discardPile: CardInstance[];
  territoryCount: number;
  totalTerritories: number;  // snapshot for quick %
}

// ─── Game ─────────────────────────────────────────────────────────────────────

export type GameMode = 'solo' | 'online' | 'bluetooth' | 'pass-and-play';
export type GamePhase = 'setup' | 'expansion' | 'main' | 'combat' | 'end-turn' | 'game-over';
export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'legend';

export interface GameSettings {
  mode: GameMode;
  playerCount: 2 | 3 | 4;
  boardSize: 'small' | 'medium' | 'large';
  aiDifficulty?: AIDifficulty;
  winCondition: 'territory' | 'elimination' | 'score';
  victoryThreshold: number;   // % of map to own for territory win
  turnTimeLimit?: number;     // seconds, undefined = unlimited
  fogOfWar: boolean;
}

export interface CombatResult {
  attackerId: string;
  defenderId: string;
  attackerDamage: number;
  defenderDamage: number;
  attackerDied: boolean;
  defenderDied: boolean;
  tileCapture?: HexCoord;
}

export interface TurnAction {
  type: 'move' | 'attack' | 'playCard' | 'buildStructure' | 'endTurn';
  playerId: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface GameState {
  id: string;
  settings: GameSettings;
  phase: GamePhase;
  currentTurn: number;
  currentPlayerId: string;
  players: Record<string, Player>;
  playerOrder: string[];
  board: Record<string, HexTile>;  // key: `${q},${r},${s}`
  units: Record<string, UnitInstance>;
  structures: Record<string, StructureInstance>;
  actionLog: TurnAction[];
  winnerId: string | null;
  startedAt: number;
  updatedAt: number;
}

// ─── Leaderboard / Profile ────────────────────────────────────────────────────

export interface PlayerProfile {
  uid: string;
  displayName: string;
  avatarKey: string;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
  favoriteCard?: string;
  unlockedCosmetics: string[];
  activeDeck: string[];   // card definition IDs
  createdAt: number;
}

// ─── Online / BLE ─────────────────────────────────────────────────────────────

export type MatchStatus = 'searching' | 'found' | 'connecting' | 'active' | 'finished' | 'error';

export interface OnlineMatch {
  matchId: string;
  hostId: string;
  guestId: string | null;
  status: MatchStatus;
  gameState?: GameState;
  createdAt: number;
}

export type BLEConnectionState = 'idle' | 'advertising' | 'scanning' | 'connecting' | 'connected' | 'error';

export interface BLEPeer {
  deviceId: string;
  name: string;
  rssi: number;
}
