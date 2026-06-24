import type { GameMode, AIDifficulty } from './game';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  MainMenu: undefined;
  ModeSelect: undefined;
  DeckBuilder: undefined;
  Lobby: { mode: GameMode };
  BluetoothLobby: undefined;
  Game: {
    mode: GameMode;
    matchId?: string;
    difficulty?: AIDifficulty;
  };
  GameOver: {
    winnerId: string;
    playerIds: string[];
    mode: GameMode;
  };
  Leaderboard: undefined;
  Profile: { uid?: string };
  Settings: undefined;
  CardCollection: undefined;
  Tutorial: { step?: number };
};

export type BottomTabParamList = {
  HomeTab: undefined;
  DeckTab: undefined;
  LeaderboardTab: undefined;
  ProfileTab: undefined;
};
