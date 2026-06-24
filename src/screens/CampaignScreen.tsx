import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { ScreenBase, BackButton, NeonText, GlassPanel, NeonButton } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/theme';
import { CAMPAIGN_MISSIONS, TOTAL_CHAPTERS } from '@/data/campaign';
import { useCampaignStore } from '@/store/campaignStore';
import type { RootStackParamList } from '@/types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: Colors.success,
  medium: Colors.warning,
  hard: Colors.accent.DEFAULT,
  legend: Colors.danger,
};

export function CampaignScreen() {
  const navigation = useNavigation<Nav>();
  const { isMissionUnlocked, isMissionCompleted, setCurrentMission } = useCampaignStore();
  const [selectedChapter, setSelectedChapter] = React.useState(1);

  const chapterMissions = CAMPAIGN_MISSIONS.filter((m) => m.chapter === selectedChapter);

  const handlePlay = (missionId: string) => {
    setCurrentMission(missionId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Game', { mode: 'solo', difficulty: 'medium' });
  };

  return (
    <ScreenBase>
      <View style={styles.header}>
        <BackButton />
        <NeonText preset="headingLarge" glow="primary" style={styles.title}>
          Campaign
        </NeonText>
        <View style={styles.spacer} />
      </View>

      {/* Chapter tabs */}
      <View style={styles.chapters}>
        {Array.from({ length: TOTAL_CHAPTERS }, (_, i) => i + 1).map((ch) => {
          const isActive = ch === selectedChapter;
          return (
            <Pressable key={ch} onPress={() => setSelectedChapter(ch)} style={styles.chapterTab}>
              <View style={[styles.chapterBadge, isActive && styles.chapterBadgeActive]}>
                <NeonText
                  preset="headingSmall"
                  color={isActive ? Colors.primary.DEFAULT : Colors.text.muted}
                >
                  CH {ch}
                </NeonText>
              </View>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {chapterMissions.map((mission, idx) => {
          const unlocked = isMissionUnlocked(mission.id);
          const completed = isMissionCompleted(mission.id);

          return (
            <GlassPanel
              key={mission.id}
              style={[styles.card, !unlocked && styles.locked]}
              radius={BorderRadius['2xl']}
            >
              <View style={styles.cardInner}>
                {/* Mission number & status */}
                <View style={styles.numCol}>
                  <View style={[styles.numCircle, completed && styles.numCompleted]}>
                    <NeonText
                      preset="headingSmall"
                      color={completed ? Colors.success : Colors.text.primary}
                    >
                      {completed ? '✓' : `${idx + 1}`}
                    </NeonText>
                  </View>
                  {idx < chapterMissions.length - 1 && <View style={styles.connector} />}
                </View>

                {/* Mission info */}
                <View style={styles.info}>
                  <View style={styles.titleRow}>
                    <NeonText
                      preset="headingSmall"
                      color={unlocked ? Colors.text.primary : Colors.text.disabled}
                    >
                      {mission.title}
                    </NeonText>
                    <View
                      style={[
                        styles.diffBadge,
                        { borderColor: DIFFICULTY_COLOR[mission.difficulty] },
                      ]}
                    >
                      <NeonText
                        preset="caption"
                        color={DIFFICULTY_COLOR[mission.difficulty]}
                      >
                        {mission.difficulty.toUpperCase()}
                      </NeonText>
                    </View>
                  </View>
                  <NeonText
                    preset="bodySmall"
                    color={unlocked ? Colors.text.secondary : Colors.text.disabled}
                    style={styles.desc}
                  >
                    {mission.description}
                  </NeonText>
                  <NeonText preset="caption" color={Colors.text.muted} style={styles.lore}>
                    "{mission.lore}"
                  </NeonText>

                  {/* Rewards */}
                  <View style={styles.rewards}>
                    <NeonText preset="caption" color={Colors.warning}>
                      +{mission.rewards.gold}◈
                    </NeonText>
                    {mission.rewards.unlockedCardIds.length > 0 && (
                      <NeonText preset="caption" color={Colors.secondary.DEFAULT}>
                        +{mission.rewards.unlockedCardIds.length} card
                        {mission.rewards.unlockedCardIds.length > 1 ? 's' : ''}
                      </NeonText>
                    )}
                  </View>

                  {unlocked && !completed && (
                    <NeonButton
                      label="Play"
                      variant="primary"
                      size="sm"
                      style={styles.playBtn}
                      onPress={() => handlePlay(mission.id)}
                    />
                  )}
                  {completed && (
                    <NeonButton
                      label="Replay"
                      variant="ghost"
                      size="sm"
                      style={styles.playBtn}
                      onPress={() => handlePlay(mission.id)}
                    />
                  )}
                  {!unlocked && (
                    <NeonText preset="caption" color={Colors.text.disabled}>
                      Complete previous mission to unlock
                    </NeonText>
                  )}
                </View>
              </View>
            </GlassPanel>
          );
        })}
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
  chapters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[6],
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  chapterTab: { flex: 1 },
  chapterBadge: {
    paddingVertical: Spacing[2],
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    backgroundColor: Colors.glass.white,
  },
  chapterBadgeActive: {
    borderColor: Colors.primary.DEFAULT,
    backgroundColor: Colors.primary.subtle,
  },
  scroll: {
    padding: Spacing[6],
    gap: Spacing[4],
    paddingBottom: Spacing[12],
  },
  card: { flex: 0 },
  locked: { opacity: 0.55 },
  cardInner: { flexDirection: 'row', padding: Spacing[5] },
  numCol: { alignItems: 'center', marginRight: Spacing[4] },
  numCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.glass.white,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numCompleted: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 20,
    backgroundColor: Colors.glass.border,
    marginTop: Spacing[2],
  },
  info: { flex: 1, gap: Spacing[2] },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  diffBadge: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
  },
  desc: {},
  lore: { fontStyle: 'italic' },
  rewards: { flexDirection: 'row', gap: Spacing[4] },
  playBtn: { marginTop: Spacing[2] },
});
