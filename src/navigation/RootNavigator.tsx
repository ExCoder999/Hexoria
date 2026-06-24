import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';

import { SplashScreen } from '@/screens/SplashScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { ModeSelectScreen } from '@/screens/ModeSelectScreen';
import { DeckBuilderScreen } from '@/screens/DeckBuilderScreen';
import { LobbyScreen } from '@/screens/LobbyScreen';
import { BluetoothLobbyScreen } from '@/screens/BluetoothLobbyScreen';
import { GameScreen } from '@/screens/GameScreen';
import { GameOverScreen } from '@/screens/GameOverScreen';
import { LeaderboardScreen } from '@/screens/LeaderboardScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { CardCollectionScreen } from '@/screens/CardCollectionScreen';
import { CampaignScreen } from '@/screens/CampaignScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="ModeSelect"
        component={ModeSelectScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="DeckBuilder"
        component={DeckBuilderScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Lobby"
        component={LobbyScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="BluetoothLobby"
        component={BluetoothLobbyScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Game"
        component={GameScreen}
        options={{ animation: 'fade', gestureEnabled: false }}
      />
      <Stack.Screen
        name="GameOver"
        component={GameOverScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="CardCollection"
        component={CardCollectionScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Campaign"
        component={CampaignScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
