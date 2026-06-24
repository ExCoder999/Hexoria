import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ScreenBase, BackButton, NeonText, GlassPanel } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/theme';

type Tab = 'global' | 'weekly' | 'friends';

// Mock data — replace with Firebase fetch
const MOCK_LEADERBOARD = [
  { rank: 1, name: 'ShadowLord', elo: 2450, wins: 312, avatar: 'S' },
  { rank: 2, name: 'HexMaster', elo: 2380, wins: 288, avatar: 'H' },
  { rank: 3, name: 'CrystalKing', elo: 2290, wins: 251, avatar: 'C' },
  { rank: 4, name: 'NeonWarlord', elo: 2210, wins: 237, avatar: 'N' },
  { rank: 5, name: 'QuantumRex', elo: 2150, wins: 198, avatar: 'Q' },
  { rank: 6, name: 'VoidWalker', elo: 2090, wins: 181, avatar: 'V' },
  { rank: 7, name: 'GridMage', elo: 2020, wins: 165, avatar: 'G' },
  { rank: 8, name: 'AetherKnight', elo: 1980, wins: 159, avatar: 'A' },
  { rank: 9, name: 'StormCaller', elo: 1930, wins: 144, avatar: 'S' },
  { rank: 10, name: 'You', elo: 1000, wins: 0, avatar: 'Y', isYou: true },
];

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

interface LeaderboardEntryProps {
  rank: number;
  name: string;
  elo: number;
  wins: number;
  avatar: string;
  isYou?: boolean;
}

function LeaderboardEntry({ rank, name, elo, wins, avatar, isYou }: LeaderboardEntryProps) {
  const rankColor = RANK_COLORS[rank - 1] ?? Colors.text.muted;
  return (
    <GlassPanel
      style={[styles.entry, isYou && styles.entryYou]}
      radius={BorderRadius.xl}
      borderWidth={isYou ? 1.5 : 1}
    >
      <View style={styles.entryInner}>
        <NeonText
          preset="headingSmall"
          color={rank <= 3 ? rankColor : Colors.text.muted}
          style={styles.rank}
        >
          {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
        </NeonText>

        <View style={[styles.avatar, { backgroundColor: isYou ? Colors.primary.subtle : Colors.glass.white }]}>
          <NeonText preset="bodySmall" color={isYou ? Colors.primary.DEFAULT : Colors.text.secondary}>
            {avatar}
          </NeonText>
        </View>

        <View style={styles.nameCol}>
          <NeonText
            preset="bodyMedium"
            color={isYou ? Colors.primary.DEFAULT : Colors.text.primary}
          >
            {name}
            {isYou ? ' (You)' : ''}
          </NeonText>
          <NeonText preset="caption" color={Colors.text.muted}>
            {wins} wins
          </NeonText>
        </View>

        <View style={styles.eloCol}>
          <NeonText
            preset="headingSmall"
            color={isYou ? Colors.primary.DEFAULT : Colors.text.primary}
          >
            {elo}
          </NeonText>
          <NeonText preset="caption" color={Colors.text.muted}>
            ELO
          </NeonText>
        </View>
      </View>
    </GlassPanel>
  );
}

export function LeaderboardScreen() {
  const [tab, setTab] = useState<Tab>('global');

  const TABS: { label: string; value: Tab }[] = [
    { label: 'Global', value: 'global' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Friends', value: 'friends' },
  ];

  return (
    <ScreenBase>
      <View style={styles.header}>
        <BackButton />
        <NeonText preset="headingLarge" glow="primary" style={styles.title}>
          Leaderboard
        </NeonText>
        <View style={styles.spacer} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <View
            key={t.value}
            style={[styles.tab, tab === t.value && styles.tabActive]}
          >
            <NeonText
              preset="bodySmall"
              color={tab === t.value ? Colors.primary.DEFAULT : Colors.text.muted}
              onPress={() => setTab(t.value)}
            >
              {t.label}
            </NeonText>
          </View>
        ))}
      </View>

      <FlatList
        data={MOCK_LEADERBOARD}
        keyExtractor={(item) => `${item.rank}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <LeaderboardEntry {...item} />
        )}
      />
    </ScreenBase>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[4],
    paddingRight: Spacing[6],
  },
  title: { flex: 1, textAlign: 'center' },
  spacer: { width: 40, marginRight: Spacing[4] },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[6],
    gap: Spacing[2],
    marginBottom: Spacing[3],
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing[2],
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    backgroundColor: Colors.glass.white,
  },
  tabActive: {
    borderColor: Colors.primary.DEFAULT,
    backgroundColor: Colors.primary.subtle,
  },
  list: {
    paddingHorizontal: Spacing[6],
    gap: Spacing[3],
    paddingBottom: Spacing[12],
  },
  entry: { flex: 0 },
  entryYou: {
    borderColor: Colors.primary.DEFAULT,
  },
  entryInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    gap: Spacing[3],
  },
  rank: {
    width: 36,
    textAlign: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  nameCol: { flex: 1 },
  eloCol: { alignItems: 'flex-end' },
});
