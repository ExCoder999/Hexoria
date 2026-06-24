import React from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { ScreenBase, BackButton, NeonText, GlassPanel } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/theme';

interface SettingRowProps {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  tint?: string;
}

function SettingRow({ label, value, onToggle, tint = Colors.primary.DEFAULT }: SettingRowProps) {
  return (
    <GlassPanel radius={BorderRadius.xl} style={styles.row}>
      <View style={styles.rowInner}>
        <NeonText preset="bodyMedium">{label}</NeonText>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: Colors.glass.white, true: tint }}
          thumbColor={Colors.text.primary}
        />
      </View>
    </GlassPanel>
  );
}

export function SettingsScreen() {
  const [sfx, setSfx] = React.useState(true);
  const [music, setMusic] = React.useState(true);
  const [haptics, setHaptics] = React.useState(true);
  const [notifications, setNotifications] = React.useState(false);

  return (
    <ScreenBase>
      <View style={styles.header}>
        <BackButton />
        <NeonText preset="headingLarge" glow="primary" style={styles.title}>
          Settings
        </NeonText>
        <View style={styles.spacer} />
      </View>

      <View style={styles.body}>
        <NeonText preset="label" color={Colors.text.muted} style={styles.section}>
          Audio
        </NeonText>
        <SettingRow label="Sound Effects" value={sfx} onToggle={setSfx} />
        <SettingRow label="Music" value={music} onToggle={setMusic} />

        <NeonText preset="label" color={Colors.text.muted} style={styles.section}>
          Device
        </NeonText>
        <SettingRow label="Haptic Feedback" value={haptics} onToggle={setHaptics} tint={Colors.accent.DEFAULT} />
        <SettingRow label="Push Notifications" value={notifications} onToggle={setNotifications} tint={Colors.secondary.DEFAULT} />
      </View>
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
  body: {
    paddingHorizontal: Spacing[6],
    gap: Spacing[3],
  },
  section: {
    marginTop: Spacing[4],
    marginBottom: Spacing[1],
  },
  row: {
    flex: 0,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
  },
});
