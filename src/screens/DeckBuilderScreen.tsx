import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
} from 'react-native';
import { ScreenBase, BackButton, NeonText, GlassPanel, NeonButton } from '@/components/ui';
import { CardView } from '@/components/game';
import { Colors, Spacing, BorderRadius } from '@/theme';
import { CARD_DATABASE, STARTER_DECK_IDS } from '@/data/cards';
import type { CardDefinition } from '@/types/game';

type FilterType = 'all' | 'unit' | 'spell' | 'structure' | 'tactic';

const MAX_DECK_SIZE = 20;
const MAX_COPIES = 2;

export function DeckBuilderScreen() {
  const [deck, setDeck] = useState<string[]>([...STARTER_DECK_IDS]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCard, setSelectedCard] = useState<CardDefinition | null>(null);

  const filteredCards = useMemo(
    () => CARD_DATABASE.filter((c) => filter === 'all' || c.type === filter),
    [filter]
  );

  const deckCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    deck.forEach((id) => {
      counts[id] = (counts[id] ?? 0) + 1;
    });
    return counts;
  }, [deck]);

  const addCard = (id: string) => {
    if (deck.length >= MAX_DECK_SIZE) return;
    if ((deckCounts[id] ?? 0) >= MAX_COPIES) return;
    setDeck((d) => [...d, id]);
  };

  const removeCard = (id: string) => {
    const idx = deck.lastIndexOf(id);
    if (idx === -1) return;
    setDeck((d) => [...d.slice(0, idx), ...d.slice(idx + 1)]);
  };

  const FILTERS: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Units', value: 'unit' },
    { label: 'Spells', value: 'spell' },
    { label: 'Structures', value: 'structure' },
    { label: 'Tactics', value: 'tactic' },
  ];

  return (
    <ScreenBase>
      <View style={styles.header}>
        <BackButton />
        <NeonText preset="headingLarge" glow="secondary" style={styles.title}>
          Deck Builder
        </NeonText>
        <NeonText preset="caption" color={Colors.text.muted}>
          {deck.length}/{MAX_DECK_SIZE}
        </NeonText>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {FILTERS.map((f) => (
          <Pressable key={f.value} onPress={() => setFilter(f.value)}>
            <View
              style={[
                styles.chip,
                filter === f.value && styles.chipActive,
              ]}
            >
              <NeonText
                preset="caption"
                color={filter === f.value ? Colors.primary.DEFAULT : Colors.text.muted}
              >
                {f.label}
              </NeonText>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.body}>
        {/* Card collection grid */}
        <FlatList
          data={filteredCards}
          keyExtractor={(c) => c.id}
          numColumns={4}
          style={styles.collection}
          contentContainerStyle={styles.collectionContent}
          renderItem={({ item: card }) => {
            const count = deckCounts[card.id] ?? 0;
            return (
              <View style={styles.cardSlot}>
                <Pressable onPress={() => addCard(card.id)} onLongPress={() => setSelectedCard(card)}>
                  <CardView
                    instanceId={card.id}
                    definitionId={card.id}
                    compact
                    isPlayable={count < MAX_COPIES && deck.length < MAX_DECK_SIZE}
                  />
                </Pressable>
                {count > 0 && (
                  <View style={styles.countBadge}>
                    <NeonText preset="caption" color={Colors.primary.DEFAULT} style={styles.countText}>
                      ×{count}
                    </NeonText>
                  </View>
                )}
              </View>
            );
          }}
        />

        {/* Current deck */}
        <GlassPanel style={styles.deckPanel} radius={BorderRadius['2xl']}>
          <NeonText preset="label" color={Colors.text.muted} style={styles.deckTitle}>
            Current Deck
          </NeonText>
          <ScrollView style={styles.deckScroll} showsVerticalScrollIndicator={false}>
            {Object.entries(deckCounts).map(([id, count]) => {
              const def = CARD_DATABASE.find((c) => c.id === id);
              if (!def) return null;
              return (
                <Pressable key={id} onPress={() => removeCard(id)} style={styles.deckRow}>
                  <NeonText preset="bodySmall" style={styles.deckName} numberOfLines={1}>
                    {def.name}
                  </NeonText>
                  <NeonText preset="caption" color={Colors.text.muted}>
                    ×{count}
                  </NeonText>
                </Pressable>
              );
            })}
          </ScrollView>
          <NeonButton
            label="Save Deck"
            variant="primary"
            size="sm"
            fullWidth
            onPress={() => {}}
            style={styles.saveBtn}
          />
        </GlassPanel>
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
    gap: Spacing[2],
  },
  title: { flex: 1, textAlign: 'center' },
  filters: {
    paddingHorizontal: Spacing[4],
    gap: Spacing[2],
    paddingBottom: Spacing[3],
  },
  chip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    backgroundColor: Colors.glass.white,
  },
  chipActive: {
    borderColor: Colors.primary.DEFAULT,
    backgroundColor: Colors.primary.subtle,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  collection: {
    flex: 1,
  },
  collectionContent: {
    padding: Spacing[3],
    gap: Spacing[2],
  },
  cardSlot: {
    position: 'relative',
    margin: Spacing[1],
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.bg.elevated,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[1],
    borderWidth: 1,
    borderColor: Colors.primary.DEFAULT,
  },
  countText: {
    fontSize: 8,
    fontWeight: '700',
  },
  deckPanel: {
    width: 140,
    margin: Spacing[3],
    flex: 0,
  },
  deckTitle: {
    padding: Spacing[3],
    paddingBottom: 0,
  },
  deckScroll: {
    maxHeight: 400,
    padding: Spacing[2],
  },
  deckRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[1.5],
    paddingHorizontal: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.border,
  },
  deckName: {
    flex: 1,
    marginRight: Spacing[1],
  },
  saveBtn: {
    margin: Spacing[3],
  },
});
