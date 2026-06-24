import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { MMKV } from 'react-native-mmkv';
import { CAMPAIGN_MISSIONS } from '@/data/campaign';

const storage = new MMKV({ id: 'hexoria_campaign' });

const SAVE_KEY = 'campaign_progress';

interface CampaignProgress {
  completedMissionIds: string[];
  unlockedCardIds: string[];
  totalGold: number;
  currentMissionId: string | null;
}

interface CampaignStore {
  progress: CampaignProgress;
  completeMission: (missionId: string, rewards: { gold: number; unlockedCardIds: string[] }) => void;
  setCurrentMission: (id: string | null) => void;
  isMissionUnlocked: (id: string) => boolean;
  isMissionCompleted: (id: string) => boolean;
  resetProgress: () => void;
}

function loadProgress(): CampaignProgress {
  const raw = storage.getString(SAVE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // corrupted save, reset
    }
  }
  return {
    completedMissionIds: [],
    unlockedCardIds: [],
    totalGold: 0,
    currentMissionId: null,
  };
}

function saveProgress(progress: CampaignProgress) {
  storage.set(SAVE_KEY, JSON.stringify(progress));
}

export const useCampaignStore = create<CampaignStore>()(
  immer((set, get) => ({
    progress: loadProgress(),

    completeMission(missionId, rewards) {
      set((s) => {
        if (!s.progress.completedMissionIds.includes(missionId)) {
          s.progress.completedMissionIds.push(missionId);
        }
        rewards.unlockedCardIds.forEach((id) => {
          if (!s.progress.unlockedCardIds.includes(id)) {
            s.progress.unlockedCardIds.push(id);
          }
        });
        s.progress.totalGold += rewards.gold;
      });
      saveProgress(get().progress);
    },

    setCurrentMission(id) {
      set((s) => {
        s.progress.currentMissionId = id;
      });
    },

    isMissionUnlocked(id) {
      const { progress } = get();
      const mission = CAMPAIGN_MISSIONS.find((m) => m.id === id);
      if (!mission) return false;
      // First mission of chapter 1 always unlocked
      if (mission.chapter === 1 && mission.number === 1) return true;

      // Must have completed previous mission in same chapter, or last of previous chapter
      const previousInChapter = CAMPAIGN_MISSIONS.find(
        (m) => m.chapter === mission.chapter && m.number === mission.number - 1
      );
      if (previousInChapter) {
        return progress.completedMissionIds.includes(previousInChapter.id);
      }
      // First mission of chapter N requires completion of last mission of chapter N-1
      const lastOfPreviousChapter = CAMPAIGN_MISSIONS.filter(
        (m) => m.chapter === mission.chapter - 1
      ).sort((a, b) => b.number - a.number)[0];
      if (lastOfPreviousChapter) {
        return progress.completedMissionIds.includes(lastOfPreviousChapter.id);
      }
      return false;
    },

    isMissionCompleted(id) {
      return get().progress.completedMissionIds.includes(id);
    },

    resetProgress() {
      const fresh: CampaignProgress = {
        completedMissionIds: [],
        unlockedCardIds: [],
        totalGold: 0,
        currentMissionId: null,
      };
      set((s) => {
        s.progress = fresh;
      });
      saveProgress(fresh);
    },
  }))
);
