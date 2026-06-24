import type { AIDifficulty, BoardSize } from '@/utils/hexMath';

export interface CampaignMission {
  id: string;
  chapter: number;
  number: number;
  title: string;
  description: string;
  difficulty: AIDifficulty;
  boardSize: BoardSize;
  victoryThreshold: number;
  startingResources: { gold: number; mana: number; ore: number };
  enemyName: string;
  lore: string;
  rewards: {
    gold: number;
    unlockedCardIds: string[];
  };
}

export const CAMPAIGN_MISSIONS: CampaignMission[] = [
  // Chapter 1 — The Awakening
  {
    id: 'c1m1',
    chapter: 1,
    number: 1,
    title: 'First Steps',
    description: 'Claim the plains and establish your realm.',
    difficulty: 'easy',
    boardSize: 'small',
    victoryThreshold: 50,
    startingResources: { gold: 15, mana: 8, ore: 5 },
    enemyName: 'Bandit Chief',
    lore: 'The realm is young. A roving band of bandits threatens your nascent kingdom.',
    rewards: { gold: 10, unlockedCardIds: ['warrior_shield_knight'] },
  },
  {
    id: 'c1m2',
    chapter: 1,
    number: 2,
    title: 'The Forest Wall',
    description: 'Defend your territory against the Forest Wardens.',
    difficulty: 'easy',
    boardSize: 'small',
    victoryThreshold: 55,
    startingResources: { gold: 12, mana: 10, ore: 4 },
    enemyName: 'Forest Warden',
    lore: 'Ancient guardians of the woods resist your expansion westward.',
    rewards: { gold: 15, unlockedCardIds: ['spell_terraform'] },
  },
  {
    id: 'c1m3',
    chapter: 1,
    number: 3,
    title: 'Mountain Pass',
    description: 'Control the mountain pass to unlock rich ore veins.',
    difficulty: 'easy',
    boardSize: 'medium',
    victoryThreshold: 50,
    startingResources: { gold: 10, mana: 6, ore: 8 },
    enemyName: 'Stone Clan',
    lore: 'The Stone Clan has held these mountains for centuries. They will not yield easily.',
    rewards: { gold: 20, unlockedCardIds: ['siege_catapult'] },
  },

  // Chapter 2 — Rising Conflict
  {
    id: 'c2m1',
    chapter: 2,
    number: 1,
    title: 'Desert Storm',
    description: 'The desert tribes unify against you. Strike fast.',
    difficulty: 'medium',
    boardSize: 'medium',
    victoryThreshold: 55,
    startingResources: { gold: 10, mana: 8, ore: 4 },
    enemyName: 'Dune Warlord',
    lore: 'Three tribes united under a single banner. Your scouts report their gold is vast.',
    rewards: { gold: 25, unlockedCardIds: ['cavalry_paladin'] },
  },
  {
    id: 'c2m2',
    chapter: 2,
    number: 2,
    title: 'The Ruined City',
    description: 'Claim the ancient ruins before the rival wizard does.',
    difficulty: 'medium',
    boardSize: 'medium',
    victoryThreshold: 60,
    startingResources: { gold: 8, mana: 15, ore: 3 },
    enemyName: 'The Pale Mage',
    lore: 'Ancient ruins pulse with residual mana. The Pale Mage seeks to harvest it all.',
    rewards: { gold: 30, unlockedCardIds: ['mage_archmage'] },
  },
  {
    id: 'c2m3',
    chapter: 2,
    number: 3,
    title: 'Siege of the Keep',
    description: 'Breach the fortress and claim the heartland.',
    difficulty: 'medium',
    boardSize: 'large',
    victoryThreshold: 55,
    startingResources: { gold: 12, mana: 8, ore: 10 },
    enemyName: 'Iron Duke',
    lore: 'The Iron Duke laughs from his impregnable fortress. Catapults will wipe the smirk away.',
    rewards: { gold: 35, unlockedCardIds: ['archer_longbow', 'tactic_ambush'] },
  },

  // Chapter 3 — The Dragon War
  {
    id: 'c3m1',
    chapter: 3,
    number: 1,
    title: 'Shadow Alliance',
    description: 'Two enemy lords have allied. Divide them.',
    difficulty: 'hard',
    boardSize: 'large',
    victoryThreshold: 60,
    startingResources: { gold: 10, mana: 10, ore: 6 },
    enemyName: 'The Twin Lords',
    lore: 'Darkness grows as old rivals forge a new pact against you.',
    rewards: { gold: 40, unlockedCardIds: ['beast_wolf_pack'] },
  },
  {
    id: 'c3m2',
    chapter: 3,
    number: 2,
    title: 'Dragon\'s Nest',
    description: 'Drive out the Ancient Dragon before it claims the northern realm.',
    difficulty: 'hard',
    boardSize: 'large',
    victoryThreshold: 65,
    startingResources: { gold: 8, mana: 12, ore: 8 },
    enemyName: 'Ancient Dragon',
    lore: 'The last dragon has awakened. Its fire consumes kingdoms in hours.',
    rewards: { gold: 50, unlockedCardIds: ['beast_dragon'] },
  },
  {
    id: 'c3m3',
    chapter: 3,
    number: 3,
    title: 'Final Conquest',
    description: 'Unify all realms under your banner.',
    difficulty: 'legend',
    boardSize: 'large',
    victoryThreshold: 70,
    startingResources: { gold: 10, mana: 10, ore: 10 },
    enemyName: 'The Shadow Emperor',
    lore: 'The source of darkness revealed at last. One realm. One ruler. This is the final battle.',
    rewards: { gold: 100, unlockedCardIds: ['warrior_king'] },
  },
];

export function getMission(id: string): CampaignMission | undefined {
  return CAMPAIGN_MISSIONS.find((m) => m.id === id);
}

export function getChapterMissions(chapter: number): CampaignMission[] {
  return CAMPAIGN_MISSIONS.filter((m) => m.chapter === chapter);
}

export const TOTAL_CHAPTERS = 3;
