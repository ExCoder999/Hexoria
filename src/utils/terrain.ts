import type { TerrainType, TerrainInfo } from '@/types/game';

export const TERRAIN_DATA: Record<TerrainType, TerrainInfo> = {
  plains: {
    type: 'plains',
    movementCost: 1,
    defenseBonus: 0,
    goldPerTurn: 1,
    manaPerTurn: 0,
    orePerTurn: 0,
    passable: true,
  },
  forest: {
    type: 'forest',
    movementCost: 2,
    defenseBonus: 2,
    goldPerTurn: 0,
    manaPerTurn: 1,
    orePerTurn: 0,
    passable: true,
  },
  mountain: {
    type: 'mountain',
    movementCost: 3,
    defenseBonus: 4,
    goldPerTurn: 0,
    manaPerTurn: 0,
    orePerTurn: 2,
    passable: true,
  },
  water: {
    type: 'water',
    movementCost: 99,
    defenseBonus: 0,
    goldPerTurn: 0,
    manaPerTurn: 0,
    orePerTurn: 0,
    passable: false,
  },
  desert: {
    type: 'desert',
    movementCost: 2,
    defenseBonus: -1,
    goldPerTurn: 2,
    manaPerTurn: 0,
    orePerTurn: 1,
    passable: true,
  },
  ruins: {
    type: 'ruins',
    movementCost: 1,
    defenseBonus: 1,
    goldPerTurn: 0,
    manaPerTurn: 2,
    orePerTurn: 1,
    passable: true,
  },
};

const TERRAIN_WEIGHTS: Record<TerrainType, number> = {
  plains: 45,
  forest: 20,
  mountain: 15,
  water: 10,
  desert: 7,
  ruins: 3,
};

const CUMULATIVE_WEIGHTS = (() => {
  const types = Object.keys(TERRAIN_WEIGHTS) as TerrainType[];
  let total = 0;
  return types.map((t) => {
    total += TERRAIN_WEIGHTS[t];
    return { type: t, threshold: total };
  });
})();
const TOTAL_WEIGHT = CUMULATIVE_WEIGHTS[CUMULATIVE_WEIGHTS.length - 1].threshold;

export function randomTerrain(seed: number): TerrainType {
  const roll = (seed % TOTAL_WEIGHT + TOTAL_WEIGHT) % TOTAL_WEIGHT;
  return CUMULATIVE_WEIGHTS.find((w) => roll < w.threshold)?.type ?? 'plains';
}

export function terrainColor(type: TerrainType): string {
  const map: Record<TerrainType, string> = {
    plains: '#1A2A1A',
    forest: '#0D2010',
    mountain: '#1A1520',
    water: '#0A1525',
    desert: '#251A0A',
    ruins: '#1A1210',
  };
  return map[type];
}

export function terrainBorderColor(type: TerrainType): string {
  const map: Record<TerrainType, string> = {
    plains: '#2A4A2A',
    forest: '#1D4020',
    mountain: '#2A2535',
    water: '#1A2540',
    desert: '#403010',
    ruins: '#352018',
  };
  return map[type];
}
