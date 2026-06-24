import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBase, BackButton, NeonText, GlassPanel, NeonButton } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/theme';

// Mock profile — replace with Firebase auth data
const MOCK_PROFILE = {
  displayName: 'You',
  elo: 1000,
  wins: 0,
  losses: 0,
  gamesPlayed: 0,
  favoriteCard: 'warrior_footsoldier',
  rank: 'Novice',
  avatar: 'Y',
};

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
}

function StatCard({ label, value, color = Colors.text.primary }: StatCardProps) {
  return (
    <GlassPanel style={styles.statCard} radius={BorderRadius.xl}>
      <View style={styles.statInner}>
        <NeonText preset="headingMedium" color={color}>
          {value}
        </NeonText>
        <NeonText preset="caption" color={Colors.text.muted}>
          {label}
        </NeonText>
      </View>
    </GlassPanel>
  );
}

export function ProfileScreen() {
  const winRate =
    MOCK_PROFILE.gamesPlayed > 0
      ? Math.round((MOCK_PROFILE.wins / MOCK_PROFILE.gamesPlayed) * 100)
      : 0;

  return (
    <ScreenBase>
      <View style={styles.header}>
        <BackButton />
        <NeonText preset="headingLarge" glow="primary" style={styles.title}>
          Profile
        </NeonText>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar & name */}
        <View style={styles.profileTop}>
          <View style={styles.avatarWrap}>
            <LinearGradient
              colors={[Colors.primary.dim, Colors.secondary.dim]}
              style={styles.avatarGrad}
            >
              <NeonText preset="displaySmall" color={Colors.text.primary}>
                {MOCK_PROFILE.avatar}
              </NeonText>
            </LinearGradient>
          </View>
          <NeonText preset="headingLarge" glow="primary">
            {MOCK_PROFILE.displayName}
          </NeonText>
          <View style={styles.rankBadge}>
            <NeonText preset="label" color={Colors.primary.DEFAULT}>
              {MOCK_PROFILE.rank}
            </NeonText>
          </View>
        </View>

        {/* ELO */}
        <GlassPanel style={styles.eloCard} radius={BorderRadius['2xl']}>
          <View style={styles.eloInner}>
            <NeonText preset="displaySmall" glow="primary" color={Colors.primary.DEFAULT}>
              {MOCK_PROFILE.elo}
            </NeonText>
            <NeonText preset="label" color={Colors.text.muted}>
              ELO Rating
            </NeonText>
          </View>
        </GlassPanel>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard label="Wins" value={MOCK_PROFILE.wins} color={Colors.success} />
          <StatCard label="Losses" value={MOCK_PROFILE.losses} color={Colors.danger} />
          <StatCard label="Games" value={MOCK_PROFILE.gamesPlayed} />
          <StatCard label="Win Rate" value={`${winRate}%`} color={Colors.primary.DEFAULT} />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <NeonButton
            label="Edit Profile"
            variant="secondary"
            size="md"
            fullWidth
            onPress={() => {}}
          />
          <NeonButton
            label="View Collection"
            variant="ghost"
            size="md"
            fullWidth
            onPress={() => {}}
          />
        </View>
      </ScrollView>
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
  scroll: {
    padding: Spacing[6],
    gap: Spacing[6],
    paddingBottom: Spacing[12],
  },
  profileTop: {
    alignItems: 'center',
    gap: Spacing[3],
  },
  avatarWrap: {
    borderRadius: 48,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.primary.DEFAULT,
    shadowColor: Colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  avatarGrad: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary.dim,
    backgroundColor: Colors.primary.subtle,
  },
  eloCard: { flex: 0 },
  eloInner: {
    padding: Spacing[8],
    alignItems: 'center',
    gap: Spacing[1],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  statCard: {
    flex: 0,
    width: '47%',
  },
  statInner: {
    padding: Spacing[5],
    alignItems: 'center',
    gap: Spacing[1],
  },
  actions: {
    gap: Spacing[3],
  },
});
