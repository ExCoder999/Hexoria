import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, Group } from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import type { HexTile } from '@/types/game';
import type { Point } from '@/utils/hexMath';
import { hexToPixel, pixelToHex, hexKey } from '@/utils/hexMath';
import { HexCell } from './HexCell';
import { Colors } from '@/theme';

interface HexGridProps {
  tiles: HexTile[];
  selectedKey: string | null;
  highlightedKeys: Set<string>;
  reachableKeys: Set<string>;
  playerColors: Record<string, string>;
  onTilePress: (tile: HexTile) => void;
  canvasWidth: number;
  canvasHeight: number;
  hexSize?: number;
}

export function HexGrid({
  tiles,
  selectedKey,
  highlightedKeys,
  reachableKeys,
  playerColors,
  onTilePress,
  canvasWidth,
  canvasHeight,
  hexSize = 36,
}: HexGridProps) {
  const origin: Point = useMemo(
    () => ({ x: canvasWidth / 2, y: canvasHeight / 2 }),
    [canvasWidth, canvasHeight]
  );

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const savedScale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(savedScale.value * e.scale, 0.5), 2.5);
    });

  const handleTilePress = useCallback((adjustedX: number, adjustedY: number) => {
    const tappedCoord = pixelToHex({ x: adjustedX, y: adjustedY }, hexSize, origin);
    const key = hexKey(tappedCoord);
    const tile = tiles.find((t) => hexKey(t.coord) === key);
    if (tile) {
      onTilePress(tile);
    }
  }, [tiles, hexSize, origin, onTilePress]);

  const tapGesture = Gesture.Tap().onEnd((e) => {
    const adjustedX = (e.x - canvasWidth / 2 - translateX.value) / scale.value + canvasWidth / 2;
    const adjustedY = (e.y - canvasHeight / 2 - translateY.value) / scale.value + canvasHeight / 2;
    runOnJS(handleTilePress)(adjustedX, adjustedY);
  });

  const composed = Gesture.Race(
    tapGesture,
    Gesture.Simultaneous(panGesture, pinchGesture)
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const cellData = useMemo(() => {
    return tiles.map((tile) => {
      const center = hexToPixel(tile.coord, hexSize, origin);
      const key = hexKey(tile.coord);
      return {
        tile,
        center,
        key,
        isSelected: key === selectedKey,
        isHighlighted: highlightedKeys.has(key),
        isReachable: reachableKeys.has(key),
        playerColor: tile.ownerId ? (playerColors[tile.ownerId] ?? null) : null,
      };
    });
  }, [tiles, hexSize, origin, selectedKey, highlightedKeys, reachableKeys, playerColors]);

  return (
    <View style={styles.root}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
          <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
            <Group>
              {cellData.map(({ tile, center, key, isSelected, isHighlighted, isReachable, playerColor }) => (
                <HexCell
                  key={key}
                  tile={tile}
                  center={center}
                  size={hexSize}
                  isSelected={isSelected}
                  isHighlighted={isHighlighted}
                  isReachable={isReachable}
                  playerColor={playerColor}
                />
              ))}
            </Group>
          </Canvas>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: Colors.bg.base,
  },
});
